class Message{
    constructor(content,userID,userName,date){
        this.content = content;
        this.senderName = userName;
        this.senderID = userID;
        this.createdDate = date;
    }
}

module.exports = Message ;