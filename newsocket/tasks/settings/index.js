"use strict";

let utils = require('modules/utils');

let searchGroups = {
    city: {
        name: 'Город',
        validate: function (value) {
            return false;
        }
    },
    count: {
        name: 'Количество',
        validate: function (value) {
            if (!utils.isInt(value) || +value > 1000) {
                return 'Должно быть числомdo 1000'
            }
            return false;
        }
    },
    country: {
        name: 'Страна',
        validate: function (value) {
            return false;
        }
    },
    offset: {
        name: 'Смещение выборки',
        validate: function (value) {
            if (!utils.isInt(value) || +value > 1000) {
                return 'Должно быть числомdo 1000'
            }
            return false;
        }
    },
    q: {
        name: 'Строка поиска',
        validate: function (value) {
            return false;
        }
    },
    groupGrid: {
        name: 'Настройки таблицы групп',
        validate: function (value) {
            return false;
        }
    },
    replaceSelector: {
        name: 'Замена списка',
        validate: function (value) {
            return false;
        }
    },
    type: {
        name: 'Адрес проверки',
        validate: function (value) {
            return false;
        }
    },
    isOpened: {
        name: 'Открытая группа',
        validate: function (value) {
            return false;
        }
    },
    isOpenWall: {
        name: 'Открытая стена',
        validate: function (value) {
            return false;
        }
    },
    isCanPost: {
        name: 'Можно постить',
        validate: function (value) {
            return false;
        }
    },
    isCanComment: {
        name: 'Можно комментировать',
        validate: function (value) {
            return false;
        }
    },
    isOfficial: {
        name: 'Неофициальное сообщество',
        validate: function (value) {
            return false;
        }
    },
    isFuture: {
        name: 'Будущее сообытие',
        validate: function (value) {
            return false;
        }
    },
    listName: {
        name: 'Название списка',
        validate: function (value, settings) {
            if (!value && settings['replaceSelector'].value === 2) {
                return 'Должно быть непустым'
            }
        }
    },
    minMembersCount: {
        name: 'Минимальное количество участников',
        validate: function (value) {
            return false;
        }
    }
};

let searchPeoples = {
    age_from: {
        name: 'Минимальный возраст',
        validate: function (value) {
            return false;
        }
    },
    age_to: {
        name: 'Максимальный возраст',
        validate: function (value) {
            return false;
        }
    },
    canWritePrivateMsg: {
        name: 'Можно написать',
        validate: function (value) {
            return false;
        }
    },
    canPost: {
        name: 'Можно постить',
        validate: function (value) {
            return false;
        }
    },
    canSendFriendRequest: {
        name: 'Можно задружиться',
        validate: function (value) {
            return false;
        }
    },
    city: {
        name: 'Город',
        validate: function (value) {
            return false;
        }
    },
    count: {
        name: 'Количество',
        validate: function (value) {
            if (!utils.isInt(value) || +value > 1000) {
                return 'Должно быть числом до 1000'
            }
            return false;
        }
    },
    country: {
        name: 'Страна',
        validate: function (value) {
            return false;
        }
    },
    from_list: {
        name: 'Поиск среди друзей',
        validate: function (value) {
            return false;
        }
    },
    has_photo: {
        name: 'С фотографией',
        validate: function (value) {
            return false;
        }
    },
    interests: {
        name: 'Интересы',
        validate: function (value) {
            return false;
        }
    },
    offset: {
        name: 'Смещение выборки',
        validate: function (value) {
            if (!utils.isInt(value) || +value > 1000) {
                return 'Должно быть числомdo 1000'
            }
            return false;
        }
    },
    online: {
        name: 'Онлайн',
        validate: function (value) {
            return false;
        }
    },
    q: {
        name: 'Строка поиска',
        validate: function (value) {
            return false;
        }
    },
    personGrid: {
        name: 'Настройки таблицы людей',
        validate: function (value) {
            return false;
        }
    },
    replaceSelector: {
        name: 'Замена списка',
        validate: function (value) {
            return false;
        }
    },
    sort: {
        name: 'Сортировать по',
        validate: function (value) {
            if (!utils.isInt(value)) {
                return 'Должно быть числом';
            }
        }
    },
    listName: {
        name: 'Название списка',
        validate: function (value, settings) {
            if (!value && settings['replaceSelector'].value === 2) {
                return 'Должно быть непустым'
            }
        }
    },
    status: {
        name: 'Семейное положение',
        validate: function (value) {
            if (!utils.isInt(value)) {
                return 'Должно быть числом';
            }
        }
    }
};

let listCreatingFromPerson = {
    fromLatest: {
        name: 'Таймаут',
        validate: function (value) {
            return false;
        }
    },
    exactSelector: {
        name: 'Количество',
        validate: function (value) {
            return false;
        }
    },
    onlyOwner: {
        name: 'Только владельца',
        validate: function (value) {
            return false;
        }
    },
    personGrid: {
        name: 'Настройки таблицы людей',
        validate: function (value) {
            return false;
        }
    },
    postGrid: {
        required: function (settings) {
            return settings['whatSelector'].value === 0;
        },
        name: 'Настройки таблицы людей',
        validate: function (value) {
            return false;
        }
    },
    photoGrid: {
        required: function (settings) {
            return settings['whatSelector'].value === 1;
        },
        name: 'Настройки таблицы людей',
        validate: function (value) {
            return false;
        }
    },
    videoGrid: {
        required: function (settings) {
            return settings['whatSelector'].value === 2;
        },
        name: 'Настройки таблицы людей',
        validate: function (value) {
            return false;
        }
    },
    replaceSelector: {
        name: 'Замена списка',
        validate: function (value) {
            return false;
        }
    },
    targetSelector: {
        name: 'Откуда',
        validate: function (value) {
            return false;
        }
    },
    whatSelector: {
        name: 'Взять',
        validate: function (value) {
            switch (value){
                case 0:
                case 1:
                case 2:
                    break;
                default :
                    return 'Значение от 0 до 2'
            }
        }
    },
    listName: {
        name: 'Название списка',
        validate: function (value, settings) {
            if (!value && settings['replaceSelector'].value === 2) {
                return 'Должно быть непустым'
            }
        }
    },
    queryString: {
        name: 'Строка поиска',
        validate: function (value) {
            return false;
        }
    }
};


let gridRefreshItem = {
    listType: {
        name: 'Тип списка',
        validate: function (value, settings) {
            if (!value && settings['replaceSelector'].value === 2) {
                return 'Обязательное поле'
            }
        }
    },
    items: {
        name: 'Элементы',
        validate: function (value, settings) {
            if (!value || !value.length) {
                return 'Обязательное поле'
            }
        }
    }
};

let proxies = {
    targetSelect: {
        name: 'targetSelect',
        validate: function (value, settings) {
           return false;
        }
    },
    deleteIfWrong: {
        name: 'deleteIfWrong',
        validate: function (value, settings) {
            return false;
        }
    }
};

module.exports = {
    searchGroups: searchGroups,
    searchPeoples: searchPeoples,
    listCreatingFromPerson: listCreatingFromPerson,
    gridRefreshItem: gridRefreshItem,
    proxies: proxies
};