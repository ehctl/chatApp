const WebSocket = require('ws');
const Message = require('./Message.js');
const chatGroup = require('./ChatGroup.js');

class Network{
    constructor(app){
        this.app = app;
    }
    //    ws://127.0.0.1:2907
     
    init(path){
        return new Promise( (resolve,reject) =>{
            this.wsConn = new WebSocket(path)
            this.wsConn.on('open', ()=>{
                resolve();
            })
        })
    }

    ready(){
        this.wsConn.addListener("message",this.parseMessage)

        this.wsConn.send(JSON.stringify({
            status: 'ready',
        }))
    }

    close(){
        this.wsConn.send(JSON.stringify({
            status: 'sad'
        }))
        this.wsConn.close();
    }

    login(userNamee,userPassword){
        this.wsConn.send(JSON.stringify({
            status: 'okay',
            op: 'login',
            userName : userNamee,
            password : userPassword
        }));

        this.wsConn.removeAllListeners();

        let callback = (message)=>{
            message = JSON.parse(message)
            if( message['status'] == "login-successful"){                
                this.app.loginSuccessful(message);  
            }else if(message['status'] == "login-failed"){
                this.app.sendLoginFailedSignal();
            }
            this.wsConn.removeAllListeners();
            this.wsConn.addListener("message",this.parseMessage)
        }
        this.wsConn.addListener('message',callback)
    }


    addListener = (message)=>{
        this.parseMessage(message)
    }

    register(info){
        this.wsConn.send(JSON.stringify({
            status: 'okay',
            op: 'register',
            userName : info['userName'],
            password : info['password'],
            firstName: info['firstName'],
            lastName: info['lastName'],
            age: info['age']
        }));

        this.wsConn.removeAllListeners();

        let callback = (message)=>{
            message = JSON.parse(message)
            if( message['status'] == "register-successful"){                
                info = { ...{userID: message['userID']},...info, ...{friendList: []}}
                this.app.loginSuccessful(info)          
            }else if(message['status'] == "register-failed"){
                this.app.sendRegisterFailedSignal();
            }
            this.wsConn.removeAllListeners()
            this.wsConn.addListener("message",this.parseMessage)
        }
        this.wsConn.addListener('message',callback)
    }

    createChatGroup(id,name,to){
        this.wsConn.send(JSON.stringify({
            status: 'okay',
            op : "createChatGroup",
            userID  : id,
            userName: name,
            to: [to]
        }))
    }

    sendMessage(message){
        this.wsConn.send(message)
    }

    parseMessage = (message)=>{
        message = JSON.parse(message);
        if( message['status'] == "okay"){
            if( message['op'] == 'chat'){
                if( message['op_k'] == 'newGroupChat'){
                    var group = new chatGroup(message['adminID'],message['adminName'],new Date())
                    group.addDescribe(message['describe'])
                    group.addManyMembers(message['member'])
                    group.setID(message['groupID'])

                    this.app.appendChatGroupList(group)

                    if( message['adminID'] == this.app.getUserID()){
                        this.app.changeRoom(group.getID())
                    }

                }else if( message['op_k'] == "sendMessage"){
                    var group = this.app.searchChatGroup(message['groupID'])
                    if(group){
                        group.addMessage(message['message'])
                        if( message['groupID'] == this.app.getCurrChatGroupID()){
                            this.app.reloadRoom()
                        }
                        this.app.pushNoti([{
                            type: 'newMessage',
                            chatGroupID: group.id,
                            content: message['message'].senderName + ' send a message'
                        }]);

                    }else console.log('cannot find groupchat')
                }
            }else if( message['op'] == 'updateInfo'){
                this.app.appendFriendTab( message['arr'])
                this.app.appendChatGroupListFromRemote( message['groupChatList'])
                this.app.pushNoti(message['notification']);
                this.app.addNormalInfo(message['info']);
            }else if( message['op'] == 'userOnline'){
                this.app.addOnlineUser( message)
            }else if( message['op'] == 'userOffline'){
                this.app.removeOnlineUser( message)
            }else if(message['op'] == 'connectionEstablised'){
                console.log("Ket noi thanh cong toi server")
            }else if(message['op'] == 'searchUserResult'){
                this.app.pushUserSearchList( message['users'])
            }else if( message['op'] == 'addFriend'){
                this.app.pushNoti([{
                    type:'addFriend',
                    content: message['content'],
                    notifier: message['id'],
                    seen: false,
                    createdDate: message['createdDate']
                }])
            }else if( message['op'] == 'replyFriendRequest'){
                this.app.pushNoti([{
                    type:'normal',
                    content: message['name'] + ' ' + message['detail'] + ' your friend request!',
                    notifier: message['id'],
                    seen: false,
                    createdDate: message['createdDate']
                }])
            }else if( message['op'] == 'newFriendOnline'){
                this.app.addNewToFriendTab(message);
            }else{
                console.log("Undifined message")
            }
        }else{
            console.log("Khong on roi!")
        }
    } 

    
}

module.exports = Network;