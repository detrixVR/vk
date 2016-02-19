
var Account = require('models/account');

module.exports.get = function (req, res) {
    res.render('workplace/test', {
        user: req.user,
        page: 'test'
    });
};

module.exports.post = function (req, res) {

    setTimeout(function(){
        res.status(200).json([
            {id: 1123, accountId: 1111, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1124, accountId: 1112, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1125, accountId: 1113, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1126, accountId: 1114, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1127, accountId: 1115, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1128, accountId: 2111, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1129, accountId: 3112, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1130, accountId: 2113, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1131, accountId: 3114, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1132, accountId: 3115, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1133, accountId: 1111, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1134, accountId: 1112, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1135, accountId: 1113, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1136, accountId: 1114, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1137, accountId: 1115, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1138, accountId: 1111, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1139, accountId: 1112, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1140, accountId: 1113, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1141, accountId: 1114, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1142, accountId: 1115, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1143, accountId: 1111, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1144, accountId: 1112, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1145, accountId: 1113, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1146, accountId: 1114, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1147, accountId: 1115, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1148, accountId: 1111, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1149, accountId: 1112, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1150, accountId: 1113, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1151, accountId: 1114, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1152, accountId: 1115, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1153, accountId: 1111, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1154, accountId: 1112, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1155, accountId: 1113, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1156, accountId: 1114, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1157, accountId: 1115, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1158, accountId: 1111, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1159, accountId: 1112, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1160, accountId: 1113, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1161, accountId: 1114, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1162, accountId: 1115, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1163, accountId: 1111, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1164, accountId: 1112, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1165, accountId: 1113, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1166, accountId: 1114, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
            {id: 1167, accountId: 1115, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'},
        ])
    }, 1000)

};

module.exports.put = function (req, res) {

   for (var i = 0; i < 50; i++) {
       var newAccount = new Account({
           uid: {
               type: String,
               required: true
           },
           instance: {
               type: Number,
               required: true
           },
           username: {
               type: String,
               required: true
           },
           accountId: {
               type: String,
               required: true
           },
           info: {
               type: Object,
               required: false,
               default:{}
           },
       })
   }
};