class Storage {

    static getItem(key, or) {
        return new Promise(function (resolve, reject) {
            try {
                browser.storage.local.get().then(function (storage) {
                    resolve(storage[key] ? JSON.parse(storage[key]) : or);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    static setItem(key, value) {
        return new Promise(function (resolve, reject) {
            try {
                browser.storage.local.get().then(function (storage) {
                    storage[key] = JSON.stringify(value);
                    browser.storage.local.set(storage);
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    static appendItem(key, value) {
        return new Promise(function (resolve, reject) {
            try {
                Storage.getItem(key, []).then(function (item) {
                    item.push(value);
                    Storage.setItem(item);
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}