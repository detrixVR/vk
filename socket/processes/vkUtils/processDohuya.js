var async = require('async');
var executeCommand = require('../../../vkapi').executeCommand;

var processDohuya = function (array, type, mode, options, processes, credentials, callback, next) {
    var i = 0;

    //275667666/*credentials.accountId*/ = 275667666;

    async.forever(function (back) {
        var array25 = array.slice(i * 25, (i + 1) * 25);
        if (array25.length) {
            var idsArray = '[';
            array25.forEach(function (item) {
                idsArray += (item.id ? item.id : item) + ',';
            });
            idsArray += ']';
            console.log(idsArray);
            var ownerIdsArray = '[';
            array25.forEach(function (item) {
                ownerIdsArray += item.owner_id + ',';
            });
            ownerIdsArray += ']';
            var accessKeysArray = '[';
            array25.forEach(function (item) {
                accessKeysArray += item.access_key || 0 + ',';
            });
            accessKeysArray += ']';
            var deleteCommand = '';
            var commandString = '';
            switch (type) {
                case 'album':
                    switch (mode) {
                        case 'video':
                            deleteCommand = 'video.deleteAlbum';
                            break;
                        case 'photo':
                            deleteCommand = 'photos.deleteAlbum';
                            break;
                        case 'audio':
                            deleteCommand = 'audio.deleteAlbum';
                            break;
                        default :
                            return back({error: 'error'});
                    }
                    commandString = '{"album_id": idsArray[i]}';
                    break;
                case 'photo':
                    deleteCommand = 'photos.delete';
                    commandString = '{"owner_id":' + 275667666/*credentials.accountId*/ + ',"photo_id": idsArray[i]}';
                    break;
                case 'video':
                    deleteCommand = 'video.delete';
                    commandString = '{"target_id":' + 275667666/*credentials.accountId*/ + ',"video_id": idsArray[i], "owner_id": ownerIdsArray[i]}';
                    break;
                case 'audio':
                    deleteCommand = 'audio.delete';
                    commandString = '{"audio_id": idsArray[i], "owner_id": ' + 275667666/*credentials.accountId*/ + '}';
                    break;
                case 'docs':
                    deleteCommand = 'docs.delete';
                    commandString = '{"doc_id": idsArray[i], "owner_id": ' + 275667666/*credentials.accountId*/ + '}';
                    break;
                case 'post':
                    deleteCommand = 'wall.delete';
                    commandString = '{"post_id": idsArray[i], "owner_id": ' + 275667666/*credentials.accountId*/ + '}';
                    break;
                case 'group':
                    deleteCommand = 'groups.leave';
                    commandString = '{"group_id": idsArray[i]}';
                    break;
                case 'note':
                    deleteCommand = 'notes.delete';
                    commandString = '{"note_id": idsArray[i]}';
                    break;
                case 'follower':
                    deleteCommand = 'account.banUser';
                    commandString = '{"user_id": idsArray[i]}';
                    break;
                case 'subscriber':
                    deleteCommand = 'friends.delete';
                    commandString = '{"user_id": idsArray[i]}';
                    break;
                case 'friend':
                    deleteCommand = 'friends.delete';
                    commandString = '{"user_id": idsArray[i]}';
                    break;
                case 'copy':
                    deleteCommand = 'photos.copy';
                    commandString = '{"owner_id": ownerIdsArray[i],"photo_id": idsArray[i], "access_key": accessKeysArray[i]}';
                    break;
                default :
                    return back({error: 'error'});
            }

            options.command = 'execute';

            options.options = {
                code: `var idsArray = ${idsArray};
                    ${((type === 'video' || type === 'copy') ? 'var ownerIdsArray = ' + ownerIdsArray + ';' : '')}
                    ${(type === 'copy' ? 'var accessKeysArray = ' + accessKeysArray + ';' : '')}
                    var i = 0;
                    while(i < idsArray.length) {
                        API.${deleteCommand}(${commandString});
                        i = i + 1;
                    }
                return i;`
            };

            executeCommand(options, processes, credentials, callback, function (err) {
                if (err) {
                    return back(err);
                } else {
                    i++;
                    return back();
                }
            });

        } else {
            return back({next: true});
        }
    }, function (err) {
        if (err.next) {
            return next();
        } else {
            return next(err);
        }
    });

};

module.exports = processDohuya;

