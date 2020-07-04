class User{
    constructor(){
        this.id=-10;
        this.userName='';
        this.password='';
        this.firstName='';
        this.lastName='';
        this.fullName = '';
        this.age = -1;

        this.friendList=[];
        this.chatGroupList=[];
        this.onlineFriend=[];
        this.currChatGroup=-1;
    }
}

module.exports = User;