var loadOnce = true;

window.onload = () =>{
    if( loadOnce){
        document.querySelector('.option-div').addEventListener('click', (e)=>{
            var t = document.querySelector('#option-dropdown');
            t.style.display = ( t.style.display == 'block' ? 'none' : 'block')
            console.log(document.querySelector('#option-dropdown'))

            e.stopPropagation()
        })

        document.querySelector('#logout').addEventListener('click',(e)=>{
            ipcRenderer.send('logout');
        })

        document.querySelector('#home').addEventListener('click', (e)=>{

            document.querySelector('#socialTab').style.display = 'none'                
            document.querySelector('#chatTab').style.display = 'none'
            document.querySelector('#homeTab').style.display = 'block'                

            currTab = 'homeTab'
        })

        document.querySelector('#social').addEventListener('click', (e)=>{

            document.querySelector('#socialTab').style.display = 'block'                
            document.querySelector('#chatTab').style.display = 'none'
            document.querySelector('#homeTab').style.display = 'none'                

            currTab = 'socialTab'
        })

        document.querySelector('#chat').addEventListener('click', (e)=>{

            document.querySelector('#socialTab').style.display = 'none'                
            document.querySelector('#chatTab').style.display = 'block'
            document.querySelector('#homeTab').style.display = 'none'                

            currTab = 'chatTab'
        })

        document.querySelector('#searchUser').addEventListener('keydown',(e)=>{

            if( event.isComposing || event.keyCode === 13){
                searchUser(document.querySelector('#searchUser').value)
            }
        })

        document.querySelector('#searchImg').addEventListener('click', (e)=>{

            searchUser(document.querySelector('#searchUser').value)
        })

        

        document.querySelector('#friendImg').addEventListener('click', (e)=>{

            document.querySelector('#notiDropdown').style.display =   'none' ;
            document.querySelector('#friend-tab').style.display = 'block';          

            e.stopPropagation();
        })

        document.querySelector('#btnMoreNoti').addEventListener('click',(e)=>{
            e.stopPropagation();
        })

        document.querySelector('#homeChangeAvatar').addEventListener('click',(e)=>{

            document.querySelector('#imageFileChooser').click();
        })

        var fileChooser = document.querySelector('#imageFileChooser');
        fileChooser.addEventListener('change',()=>{

            if(fileChooser.files[0]){
                var reader = new FileReader();
    
                reader.onload = function(e) {
                    document.querySelector('#btnChangeAvatar').style.display = 'block';
                    document.querySelector('#btnChangeAvatar').style.margin = 'block';

                    document.querySelector('#previewImg').style.display = 'block';
                    document.querySelector('#previewImg').src = e.target.result;
                    console.log(e.target.result)
                }
                reader.readAsDataURL(fileChooser.files[0])
            };
        })

        document.querySelector('#notiImg').addEventListener('click', (e)=>{

            document.querySelector('#notiDropdown').style.display =  'block' ;
            document.querySelector('#friend-tab').style.display = 'none';    

            if(newNoti){
                document.querySelector('#notiImg').src = './noti.png'
                newNoti = false;
                ipcRenderer.send('readAllNoti');
            }

            e.stopPropagation();
        })
 
        document.querySelector('#btnChangeAvatar').addEventListener('click', (e)=>{

            var reader = new FileReader();
            document.querySelector('#previewImg').style.display = 'none';
            document.querySelector('#btnChangeAvatar').style.display = 'none'

            reader.onload = function(e) {
                ipcRenderer.send('changeAvatar',e.target.result);
            }
            reader.readAsDataURL(fileChooser.files[0])
        })

        document.body.addEventListener('click', (e) =>{

            let list = document.querySelectorAll('.dropdown-content');
            if( list.length > 0) {
                for(i=0 ; i<list.length ; i++){
                    list[i].style.display = 'none'
                }
            }            
        })

        loadOnce = false;
    }
}

acceptFriendRequest = (id,t,t1,e)=>{
    let parent = t.parentNode;
    parent.removeChild(t);
    parent.removeChild(t1);
    
    let text = document.createElement('div')
    text.innerHTML = 'You acepted'

    parent.appendChild(text)

    ipcRenderer.send('acceptFriendRequest',id)

    e.stopPropagation();
}

rejectFriendRequest = (id,t,t1,e)=>{
    let parent =    t.parentNode;
    parent.removeChild(t);
    parent.removeChild(t1);
    
    let text = document.createElement('div')
    text.innerHTML = 'You rejected'

    parent.appendChild(text)

    ipcRenderer.send('rejectFriendRequest',id)
    e.stopPropagation();
}

searchUser = (userFullname)=>{
    if( ! /^[\s]*$/.test(userFullname) ){
        console.log(document.querySelector('#loadingGif'))
        document.querySelector('#loadingGif').style.display = 'block'

        let friendBlock = document.querySelector(".friend-block");
        while(friendBlock.firstChild){
            friendBlock.removeChild(friendBlock.firstChild)
        }

        ipcRenderer.send('searchUser',userFullname);
    }
}


groupchatClick= (t) => {
    ipcRenderer.send('loadRoom',t.value);
}

imgSendClick= ()=>{
    sendMesageSignal()
    addMessageFromInput()
    document.querySelector('#input').focus();
}

inputKeydown = (e) =>{
    if( e.keyCode  == 13){
        sendMesageSignal()
        addMessageFromInput();
    }
}

sendMesageSignal= ()=>{
    let input = document.querySelector('#input');
    var inputRegex = /[\S]+/;
    if( input.value.match(inputRegex) ){
        ipcRenderer.send("sendMessage",JSON.stringify({
            message: input.value
        }))
    }
}

btnCreateClick = () =>{
    ipcRenderer.send("create:chatGroup")
}

friendLinkClicK = (t,e) =>{
    var link = t.childNodes[2];
    if( link.style.display == "block" ){
        link.style.display = "none"
    }
    else{
        link.style.display = "block"
    }
    e.stopPropagation();
}

addFriend = (node) => {
    ipcRenderer.send('addFriend',node.value);
}

addUserSearchList = (user)=>{
    let friendBlock = document.querySelector(".friend-block");
   
    let friendInfo = document.createElement('div');
    friendInfo.classList.add('friend-info');

    let hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.value = user['_id'];
    
    let img1 = document.createElement('img');
    img1.src = './cat.png';
    img1.classList.add('avatar');

    let info = document.createElement('div');
    info.classList.add('inline-block');

    let name = document.createElement('p');
    name.innerHTML = user['name'];

    let bio = document.createElement('p');
    bio.innerHTML = user['age'];

    let btnImg = document.createElement('div');
    btnImg.classList.add('btnImg');

    let btnImg1 = document.createElement('img');
    btnImg1.src = './message.png';
    btnImg1.addEventListener('click', (event) => ((arg) => aChatClick(arg,event))(hidden))

    let btnImg2 = document.createElement('img');
    btnImg2.src = './addFriend.png';
    btnImg2.addEventListener('click', (event) => ((arg) => addFriend(arg))(hidden))


    friendInfo.appendChild(hidden);
    friendInfo.appendChild(img1);
    friendInfo.appendChild(info);
    friendInfo.appendChild(btnImg);

    info.appendChild(name);
    info.appendChild(bio);

    btnImg.appendChild(btnImg1);
    btnImg.appendChild(btnImg2);

    friendBlock.appendChild(friendInfo);

}

addMessageFromInput = () => {
    let input = document.querySelector('#input');
    var inputRegex = /[\S]+/;
    if( input.value.match(inputRegex) ){
        var room = document.querySelector('#room')
        var div1 = document.createElement('div')
        div1.classList.add("block");

        var div2 = document.createElement('div')
        div2.classList.add("float-right")

        var img = document.createElement('img')
        img.classList.add("img-avatar")
        img.src = "avatar.png"

        var div3 = document.createElement('div')
        div3.classList.add("message-2")
        div3.classList.add("float-right")
        div3.innerHTML = input.value;
    
        div2.appendChild(img) 
        div1.appendChild(div2)
        div1.appendChild(div3)
        room.appendChild(div1)
        document.querySelector("#room").scrollTop = document.querySelector("#room").scrollHeight;
    }
    input.value ='';
}

addMessageFromData = (choice,message) => {
    var room = document.querySelector('#room')
    var div1 = document.createElement('div')
    div1.classList.add("block");

    var div2 = document.createElement('div')

    var img = document.createElement('img')
    img.classList.add("img-avatar")
    img.src = "avatar.png"

    var div3 = document.createElement('div')
    if( choice == 1){
        div2.classList.add("float-left")
        div3.classList.add("message-1")
        div3.classList.add("float-left")
    }
    else if(choice == 2){
        div2.classList.add("float-right")
        div3.classList.add("message-2")
        div3.classList.add("float-right")
    }

    div3.innerHTML = message;

    div2.appendChild(img) 
    div1.appendChild(div2)
    div1.appendChild(div3)
    room.appendChild(div1)
    document.querySelector("#room").scrollTop = document.querySelector("#room").scrollHeight;
}

addGroupChat = (roomID,userName,describe) =>{
    var section = document.querySelector('#secGroupChat')

    var groupChat = document.createElement('div')

    var hidden = document.createElement('input')
    hidden.type='hidden'
    hidden.value = roomID

    var div1 = document.createElement('div')
    div1.classList.add('inline-block')
    div1.classList.add('div-30')

    var img = document.createElement('img')
    img.src='groupAvatar.png'
    div1.appendChild(img)

    var div2 = document.createElement('div')
    div2.classList.add('inline-block')
    div2.classList.add('div-70')

    var div2_c1 = document.createElement('div')
    div2_c1.classList.add('groupChat-header')
    div2_c1.innerHTML = userName

    var div2_c2 = document.createElement('div')
    div2_c2.classList.add('groupChat-detail')
    div2_c2.innerHTML = describe

    div2.appendChild(div2_c1)
    div2.appendChild(div2_c2)

    groupChat.appendChild(hidden)   
    groupChat.appendChild(div1)
    groupChat.appendChild(div2)

    groupChat.addEventListener('click', (event) => ((arg) => groupchatClick(arg))(hidden));

    groupChat.addEventListener('mouseover',()=>{
        groupChat.style.cursor = "pointer"
        groupChat.style.color = 'gray'
    })
    
    groupChat.addEventListener('mouseout',()=>{
        groupChat.style.cursor = "context-menu"
        groupChat.style.color = 'white'
    })

    section.insertBefore(groupChat, section.firstChild)
}

addNotification = (noti) =>{
    var notiDropdownBody = document.querySelector('#notiDropdownBody');
    if( noti.type == 'addFriend'){
        let request = document.createElement('div');
        request.classList.add('dropdown-addFriend-request');

        let text = document.createElement('div');
        text.innerHTML = noti.content;

        let hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.value = noti.notifier;

        let reject = document.createElement('button');
        let accept = document.createElement('button');

        reject.addEventListener('click', (event)=> ((arg,arg1,arg2)=> rejectFriendRequest(arg,arg1,arg2,event))(hidden.value,reject,accept));    
        reject.innerHTML = 'Reject';
        
        accept.addEventListener('click', (event)=> ((arg,arg1,arg2)=> acceptFriendRequest(arg,arg1,arg2,event))(hidden.value,accept,reject));        
        accept.innerHTML = 'Accept';
        
        notiDropdownBody.insertBefore(request,notiDropdownBody.firstChild);
        request.append(text);
        request.append(reject);
        request.append(accept);
        request.append(hidden);
    }else if(noti.type == 'normal'){
        let normal = document.createElement('div')
        normal.classList.add('dropdown-normal-noti');

        let text = document.createElement('div')
        text.innerHTML = noti.content;

        normal.appendChild(text)
        notiDropdownBody.insertBefore(normal,notiDropdownBody.firstChild);
    }
}

addToFriendTab = (user) => {
    let name = user.name;
    let id = user.id;
    var friendTab = document.querySelector('#onlineFriend-tab')
    
    var div1 = document.createElement('div')
    div1.classList.add('tabFriend')

    var div2 = document.createElement('div')
    div2.classList.add('full-width')
    div2.classList.add('block')

    var div3 = document.createElement('div')
    div3.classList.add('tabName')
    div3.innerHTML = name

    var img1 = document.createElement('img')
    img1.src = user.avatar
    img1.classList.add('tabAvatar')

    var img2 = document.createElement('img')
    img2.src = './online.png'
    img2.classList.add('tabOnline')
    if(user.status == 'offline')
        img2.style.display = 'none';

    var div4 = document.createElement('div')
    div4.classList.add('dropdown-content')

    var a1 = document.createElement('div')
    a1.classList.add('aWall')
    a1.innerHTML = name + "'s wall"

    var a2 = document.createElement('div')
    a2.classList.add('aChat')
    a2.innerHTML = 'Chat'

    var hidden1 = document.createElement('input')
    hidden1.type = 'hidden'
    hidden1.value = id

    var hidden2 = document.createElement('input')
    hidden2.type = 'hidden'
    hidden2.value = id

    a2.appendChild(hidden1)

    div4.appendChild(a1)
    div4.appendChild(a2)

    div2.appendChild(img1)
    div2.appendChild(div3)
    div2.appendChild(img2)

    div1.appendChild(hidden2)
    div1.appendChild(div2)
    div1.appendChild(div4)

    div1.addEventListener('click', (event) => ((arg) => friendLinkClicK(arg,event))(div1));
    a2.addEventListener('click', (event) => ((arg) => aChatClick(arg,event))(hidden1));
    friendTab.appendChild(div1)
}

aChatClick = (t,e)=>{
    e.preventDefault();
    let info = {
        to: t.value
    }

    if( currTab == 'socialTab' || currTab == 'homeTab'){
        document.querySelector('#chat').click()
    }

    ipcRenderer.send("chat",JSON.stringify(info))
}


const electron = require("electron");
const { ipcRenderer } = electron
var userID = 1;
var currTab = 'socialTab'
var isLoading = false;
var newNoti = false;

ipcRenderer.on("info",(e,info)=>{
    userID = info['id']

    document.querySelector('#username').innerHTML = info['fullName'];
    document.querySelector('#homeTabun').innerHTML = info['fullName']

    document.querySelector("#username").addEventListener('click',(e)=>{
        document.querySelector('#homeTab').click() 
        e.preventDefault()
    })

    document.querySelector("#id").addEventListener('click',(e)=>{
        alert('ID: ' + info['id'] + '\nUsername: ' + info["userName"] + "\nFull Name: " + info['fullName'] +"\nAge: " + info['age'] )
        e.preventDefault()
    })

    let groupList = info['chatGroupList']
    for(i=0 ; i<groupList.length ; i++){
        addGroupChat( groupList[i].id,groupList[i].adminName,groupList[i].describe)
    }
})

ipcRenderer.on('loadRoom',(e,info)=>{
    var room = document.querySelector('#room')
   
    
    while(room.firstChild){
        room.removeChild(room.firstChild);
    }

    for(let i=0 ; i<info['room'].message.length ; i++){
        if( info['room'].message[i].senderID == userID){
            addMessageFromData(2,info['room'].message[i].content)
        }else{
            addMessageFromData(1,info['room'].message[i].content)
        }
    }
    
})

ipcRenderer.on('userSearchList', (e,users)=>{
    if(!isLoading){
        isLoading = true;
        setTimeout( ()=>{
            document.querySelector('#loadingGif').style.display = 'none'   

            for(var user of users){
                if( user._id != userID)
                    addUserSearchList(user)
            }
            isLoading = false;
        },500);
    }
})

ipcRenderer.on('addFriend',(e,user)=>{
    addNotification('addFriend',user)
})



ipcRenderer.on('addGroupChat',(e,info)=>{
    addGroupChat( info['id'], info['adminName'], info['describe'])
})

ipcRenderer.on('notification',(e,noti)=>{
    addNotification(noti)
    if(!noti.seen && !newNoti){
        document.querySelector('#notiImg').src = './noti.gif'
        newNoti = true;
    }
})

ipcRenderer.on('loadFriendTab',(e,info)=>{
    let friendTab = document.querySelector('#onlineFriend-tab')

    while(friendTab.firstChild){
        friendTab.removeChild(friendTab.firstChild);
    }

    for(var friend of info){
        addToFriendTab(friend);
    }
})

ipcRenderer.on('addNewFriend', (e,friend)=>{
    addToFriendTab(friend);
})

ipcRenderer.on('addNormalInfo',(e,info)=>{
    document.querySelector('#homeAvatar').src = info.avatar;
    document.querySelector('.homeTabBody').innerHTML = 'Age: ' + info.age + "\n...";
})

ipcRenderer.on('addOnlineUser',(e,id)=>{
    let friendtab = document.querySelector('#onlineFriend-tab')
    console.log(friendtab.childNodes)
    for( var i=0 ; i<friendtab.childNodes.length ; i++){
        if( friendtab.childNodes[i].childNodes[0].value == id){
            friendtab.childNodes[i].childNodes[1].childNodes[2].style.display = 'block'
        }
    }
})

ipcRenderer.on('removeOnlineUser',(e,id)=>{
    let friendtab = document.querySelector('#onlineFriend-tab')

    for( var i=0 ; i<friendtab.childNodes.length ; i++){
        if( friendtab.childNodes[i].childNodes[0].value == id){
            friendtab.childNodes[i].childNodes[1].childNodes[2].style.display = 'none'
        }
    }
})


