const Message = require('./Message.js')

class chatGroup{
    constructor(adID,adName,date){
        this.id = 0;
        this.name = "group " + Math.floor(Math.random() * 1000)
        this.adminID = adID; 
        this.adminName = adName;
        this.member = [];
        this.message = [];
        this.describe = 'none'
        this.member.push(adID)
        this.createdDate = date
    }

    static fromPattern(groupp){
        var temp  = new chatGroup(groupp['adminID'], groupp['adminName'], groupp['createdDate'] )
        temp.id = groupp['id'];
        temp.name = groupp['name']
        temp.member = groupp['member'];
        temp.message = groupp['message']
        temp.describe =groupp['describe'];
        return temp;
    }

    setID(id){
        this.id = id;
    }

    setName(name){
        this.name = name;
    }

    getID(){
        return this.id;
    }

    getAdminID(){
        return this.adminID
    }

    getAdminName(){
        return this.adminName
    }

    getDescribe(){
        return this.describe
    }

    addDescribe(describe){
        this.describe = describe
    }

    addMessage(message){
        this.message.push(message)
    }

    addManyMembers(member){
        this.member = member
    }

    addMember(userID){
        let dup = false;
        for(let i=0 ; i<this.member.length ; i++){
            if( userID == this.member[i]){
                dup =true;
            }
        }
        if(!dup)
            this.member.push(userID);
    }
}


module.exports = chatGroup;
