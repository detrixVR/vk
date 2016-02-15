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
            {id: 1127, accountId: 1115, firstName: 'Имя', lastName: 'Фамилия', photo: 'http://vk.com/images/camera_50.png'}
        ])
    }, 5000)

};