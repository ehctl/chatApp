const electron = require("electron")
const url = require('url')
const path = require('path')
const fs = require('fs')
const Network = require("./network.js")
const ChatGroup = require('./ChatGroup.js')
const Message = require('./Message.js')
const User = require('./User.js')
const { group, info } = require("console")

const { app , BrowserWindow , ipcMain } = electron;

class App{
    constructor(){
        this.user = new User();
        this.network = new Network(this);
        this.status = 'normal'
        this.onlineUser = [];
    }

    start(){
        app.on('ready', ()=>{
            this.network.init('ws://127.0.0.1:2907')
            .then( ()=>{
                this.loadDataFromFile()
                .then( (info) =>{
                    var data = JSON.parse(info);
                    if( data['user']){
                        this.user = data['user'];
                        this.network.login( this.user.userName, this.user.password)
                    }else{
                        return Promise.reject('user is not defined in data')
                    }
                })
                .catch( (err)=> {
                    this.loadLoginWindow()
                })
            })
            .catch( (err) =>{
                console.log(err + " 0")
                this.loadLoginWindow()
            })
        })
        
        app.on('close', () =>{

        })

        ipcMain.on("login", (e,info) =>{                
            info = JSON.parse(info);
            this.network.login(info['userName'],info['password'])
        })  

        ipcMain.on('logout',(e)=>{
            this.network.sendMessage(JSON.stringify({
                status: 'okay',
                op: 'logout',
            }))

            this.user = new User();
            this.status = 'logout';
            this.homeWindow.hide();
            
            this.loadLoginWindow();
            this.status = 'normal';
        })

        ipcMain.on('register',(e,info)=>{
            info = JSON.parse(info);
            this.network.register(info)
        })

        ipcMain.on("chat",(e,info)=>{
            info = JSON.parse(info)
            
            let a = []
            a.push(info['to'])
            a.push(this.user.id)
            var roomID = this.checkExits(a)
            if( roomID == -1){
                this.network.createChatGroup(this.user.id,this.user.fullName,info['to']);
            }
            else{
                this.user.currChatGroup = roomID
                this.changeRoom(roomID)
            }
        })

        ipcMain.on("loadRoom",(e,roomID)=>{
            this.homeWindow.webContents.send('loadRoom',{
                room: this.searchChatGroup(roomID)
            })
            this.user.currChatGroup = roomID
        })
        
        ipcMain.on('sendMessage',(e,info)=>{
            info = JSON.parse(info)

            this.network.sendMessage(JSON.stringify({
                status: "okay",
                op: "chat",
                op_k: "sendMessage",
                message: info['message'],
                groupID: this.user.currChatGroup,
            }))
        }) 

        ipcMain.on('searchUser', (e,userFullname)=>{
            this.network.sendMessage(JSON.stringify({
                status: "okay",
                op: "searchUser",
                name: userFullname
            }))
        })

        ipcMain.on('addFriend', (e,idd)=>{
            this.network.sendMessage(JSON.stringify({
                status: 'okay',
                op: 'addFriend',
                to: idd
            }))
        })

        ipcMain.on('acceptFriendRequest', (e,idd)=>{
            this.network.sendMessage(JSON.stringify({
                status: 'okay',
                op: "replyFriendRequest",
                detail: 'accept',
                id: idd,
            }))
        })

        ipcMain.on('rejectFriendRequest', (e,idd)=>{
            this.network.sendMessage(JSON.stringify({
                status: 'okay',
                op: "replyFriendRequest",
                detail: 'reject',
                id: idd,
            }))
        })

        ipcMain.on('changeAvatar', (e,img)=>{
            this.network.sendMessage(JSON.stringify({
                status: 'okay',
                op: "changeAvatar",
                img: img,
            }))
        })

        ipcMain.on('readAllNoti',(e)=>{
            this.network.sendMessage(JSON.stringify({
                status: 'okay',
                op: 'readAllNoti'
            }))
        })
    }

    loginSuccessful(info){ 
        //load info
        this.user.id = info['userID'];
        this.user.userName = info['userName']
        this.user.password = info['password']
        this.user.userName = info['userName'];
        this.user.firstName = info['firstName'];
        this.user.lastName = info['lastName'];
        this.user.fullName = info['firstName']+" "+info['lastName'];
        this.user.age = info['age'];
        this.user.friendList = info['friendList'];
        this.user.chatGroupList = [];

        if(!this.homeWindow){
            this.homeWindow = new BrowserWindow({
                width:800,
                height:800,
                webPreferences: {
                    nodeIntegration: true,
                    webviewTag: true
                }
            });

            this.homeWindow.once('closed', ()=>{
                this.quit();
            })

            this.homeWindow.loadURL(url.format({
                pathname: path.join(__dirname,'layout/test.html'),
                protocol: 'file:',
                slashes: true,
            }))

            this.homeWindow.webContents.on('did-finish-load',()=>{
                this.homeWindow.webContents.send('info',{
                    id: this.user.id,
                    userName: this.user.userName,
                    fullName: this.user.fullName,
                    age: this.user.age,
                    chatGroupList: this.user.chatGroupList
                })
                this.network.ready()
            
                if( this.user.chatGroupList.length > 0) {
                    this.changeRoom( this.user.chatGroupList[0].getID())
                }
            })
        }else{
            this.homeWindow.reload();
        }

        if(this.loginWindow)
            this.loginWindow.hide()
    
        this.homeWindow.show();
    }

    quit(){
        if(this.status  == 'normal'){
            this.status = 'quit';
            this.saveToFile()
            .then( (mes) => console.log(mes))
            .catch( (err) => console.log(err))

            console.log('fssy')
            this.network.close()
            app.quit()
        }
    }

    pushNoti(notis){
        for(var noti of notis){
            this.homeWindow.webContents.send('notification',noti)
        }
    }

    saveToFile(){
        return new Promise( (resolve,reject)=>{
            var data={
                user: this.user,
                lasttimeUsed: new Date(),
            };
            var buffer = Buffer.from(JSON.stringify(data),'utf8')
            fs.writeFile("/test.dat",buffer.toString('base64'), function(err) {
                if(err) {
                    reject("Cannot save data to file")
                }
                resolve("Saved data to file!");
            }); 
        })
    }

    loadDataFromFile(){
        return new Promise( (resolve,reject)=>{
            fs.readFile("/test.dat", (err,data)=>{
                if( err) reject(err);
                else {
                    resolve(Buffer.from(data.toString(),'base64').toString('utf8'));
                }
            })
        })
    }

    addNormalInfo(info){
        this.homeWindow.webContents.send('addNormalInfo',info)
    }

    pushUserSearchList(users){
        this.homeWindow.webContents.send('userSearchList',users)
    }

    waitForServerResponseLoginSignal(){
        this.loginWindow.webContents.send('wait-for-login-signal');
    }

    loadLoginWindow(){
        if(!this.loginWindow){
            this.loginWindow = new BrowserWindow({
                width: 600,
                height: 400,
                webPreferences: {
                    nodeIntegration: true,
                    webviewTag: true,
                }
            });
        
            this.loginWindow.loadURL(url.format({
                pathname: path.join(__dirname,'layout/loginWindow.html'),
                protocol: 'file:',
                slashes: true
            }))

            this.loginWindow.on('closed',()=>{
                this.quit();
            })
        }else{
            this.loginWindow.show();
            this.loginWindow.reload();
        }
    }

    sendLoginFailedSignal(){
        if( this.loginWindow)   
            this.loginWindow.webContents.send('login-failed');
        else{
            this.loadLoginWindow()
        }
    }

    sendRegisterFailedSignal(){
        this.loginWindow.webContents.send('register-failed');
    }

    appendChatGroupListFromRemote(groups){
        for(var groupp of groups){
            var newgroup  =  new ChatGroup(groupp.adminID,groupp.adminName,groupp.createdDate);
            newgroup.setID(groupp._id)
            newgroup.setName(groupp.name)
            newgroup.addManyMembers(groupp.member)
            for(var mess of groupp.message){
                newgroup.addMessage( new Message(mess.content,mess.senderID,mess.senderName,new Date()))
            }

            this.user.chatGroupList.push(newgroup)
            this.addGroupChat(newgroup)
        }
    }

    //create new groupchat
    appendChatGroupList(group){
        if(!this.searchChatGroup(group.getID())){
            this.user.chatGroupList.push(group)
            this.addGroupChat(group)
        }
    }

    //send addgroupChat singnal
    addGroupChat(groupp){
        this.homeWindow.webContents.send('addGroupChat',{
            id: groupp.getID(),
            adminName: groupp.getAdminName(),
            describe: groupp.getDescribe()
        })
    }

    appendFriendTab(arr){
        this.homeWindow.webContents.send('loadFriendTab',(arr))
    }
    
    addNewToFriendTab(friend){
        this.homeWindow.webContents.send('addNewFriend',friend)
    }

    addOnlineUser(user){
        let i = user['id']
        let dup = false;
        this.homeWindow.webContents.send('addOnlineUser',i)
        
        for(var u of this.onlineUser){
            if( u['id'] == i || i == this.user.id){
                dup = true
                break
            }
        }
        
        if( dup == false){
            this.onlineUser.push({
                id: i
            })
        }
    }

    removeOnlineUser(user){
        let idd = user['id'];
        this.homeWindow.webContents.send('removeOnlineUser',idd)
        var ind = -1;
        for(var i=0 ; i<this.onlineUser.length ; i++){
            if( this.onlineUser[i]['id'] == idd){
                ind = i;
                break;
            }
        }

        if( ind != -1){
            this.onlineUser.splice(ind,1)
        }
        
    }

    changeRoom(roomID){
        let t = this.searchChatGroup(roomID);
        if(t){
            this.homeWindow.webContents.send('loadRoom',{
                room: t
            })
            this.user.currChatGroup = roomID
        }else{
            console.log("canot find room")
        }
    }

    reloadRoom(){
        let t = this.searchChatGroup(this.user.currChatGroup);
        this.homeWindow.webContents.send('loadRoom',{
            room: t
        })
    }
 
    getCurrChatGroupID(){
        return this.user.currChatGroup;
    }

    searchChatGroup(id){
        var temp = null;
        this.user.chatGroupList.forEach( (e)=>{
            if( e.getID() == id){
                temp = e;
            }
        } )
        return temp;
    }

    checkExits(member){
        var size = member.length;
        var count = 0;
        var roomID = -1;
        var run = true
        for(let i=0 ; i<this.user.chatGroupList.length && run; i++){
            for(let j=0 ; j<this.user.chatGroupList[i].member.length; j++){
                if( this.user.chatGroupList[i].member.length != member.length){
                    run = false;
                    break;
                }
                count = 0;
                for(let k=0 ; k< member.length; k++){
                    if( this.user.chatGroupList[i].member.includes(member[i]) ){
                        count +=1
                    }
                }
                if( count == size) {
                    roomID = this.user.chatGroupList[i].id
                    run = false;
                    break;
                }
            }
        }
        return roomID;
    }

    getUserID(){
        return this.user.id;
    }
}

module.exports = App