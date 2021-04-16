
const path = require('path')
const fs = require('fs')

const initSqlJs = require('sql.js')

const config = {
    locateFile: filename => path.join(__dirname, `../static/js/${filename}`)
}

const dbOpen = (databaseFileName, SQL) => {
    try {
        // fileBuffer
        const fileBuffer = fs.readFileSync(databaseFileName)
        return new SQL.Database(fileBuffer)
    } catch (error) {
        console.log("Can't open database file.", error.message)
        return null
    }
}

const dbClose = (databaseHandle, databaseFileName) => {
    // 将数据库写入磁盘
    try {
        let data = databaseHandle.export()
        let buffer = Buffer.alloc(data.length, data)
        fs.writeFileSync(databaseFileName, buffer)
        databaseHandle.close()
        return true
    } catch (error) {
        console.log("Can't close database file.", error)
        return null
    }
}

export const initDb =  (appPath, callback) => {
    // 数据库路径
    let dbPath = path.join(appPath, 'note.db')
    window.dbPath = dbPath
    let createDb = function(dbPath, SQL) {
        console.log('createDb');
        let db = new SQL.Database()
        let query = fs.readFileSync(
            path.join(__dirname, './sql', 'note.sql'),
            'utf-8'
        )
        let result = db.exec(query)
        console.log('result', Object.keys(result).length);
        if (Object.keys(result).length === 0 &&
            typeof result.constructor === 'function' &&
            dbClose(db, dbPath)) {
            console.log('Created a new database.')
        } else {
            console.log('model.initDb.createDb failed.')
        }
    }
    initSqlJs(config).then(SQL => {
        //...
        let db = dbOpen(dbPath, SQL)
        console.log('db', db);
        if (db === null) {
            console.log('数据库不存在');
            createDb(dbPath, SQL)
        } else {
            console.log('数据库存在');
            let query = 'SELECT count(*) as `count` FROM `note_class`'
            let row = db.exec(query)
            let tableCount = parseInt(row[0].values)
            console.log('tableCount', tableCount);

            if (typeof callback === 'function') {
                callback()
            }
        }
    })
}

let _rowsFromSqlDataObject = function (object, type) {
    const { values, columns } = object
    let data = type === 'Array' ? [] : {}
    let i = 0
    let j = 0
    for (let valueArray of values) {
      data[i] = {}
      j = 0
      for (let column of columns) {
        Object.assign(data[i], {[column]: valueArray[j]})
        j++
      }
      i++
    }
    return data
}
// ?,?,? 占位
let _placeHoldersString = (length) => {
    let places = ''
    for (let i = 1; i <= length; i++) {
      places += '?, '
    }
    return /(.*),/.exec(places)[1]
}

let saveFormData = ({tableName, keyValue}) => {
    // console.log('keyValue', keyValue);
    return new Promise(async (resolve, reject) => {
        let SQL = await initSqlJs(config)
        let db = dbOpen(window.dbPath, SQL)
        if (db !== null) {
            let query = 'INSERT OR REPLACE INTO `' + tableName
                query += '` (`' + keyValue.columns.join('`, `') + '`)'
                query += ' VALUES (' + _placeHoldersString(keyValue.values.length) + ')'
            let statement = db.prepare(query)
            try {
                if (statement.run(keyValue.values)) {
                    resolve()
                }
            } catch (error) {
                console.log('error', error);
                reject()
            } finally {
                dbClose(db, window.dbPath)
            }
        }
    })
}
let updateFormData = ({tableName, keyValue, primaryKey}) => {
    return new Promise(async (resolve, reject) => {
        let SQL = await initSqlJs(config)
        let db = dbOpen(window.dbPath, SQL)
        let { values, columns } = keyValue
        let primaryKeyValue = ''
        if (db !== null) {
            let str = ''
            columns.forEach((key, index) => {
                if (key == primaryKey) {
                    primaryKeyValue = values[index]
                } else {
                    str += `${key}="${values[index]}"`
                    if (index < columns.length - 1) {
                        str += ', '
                    }
                }
            });
            let query = `update \`${tableName}\` set ${str} where ${primaryKey}=${primaryKeyValue}`
            console.log(query);
            try {
                if (db.exec(query)) {
                    resolve()
                }
            } catch (error) {
                console.log('error', error);
                reject()
            } finally {
                dbClose(db, window.dbPath)
            }
        }
    })
}
// 获取列表
let getList = (tableName, condition) => {
    return new Promise(async (resolve, reject) => {
        let SQL = await initSqlJs(config)
        let db = dbOpen(window.dbPath, SQL)
        if (db !== null) {
            let query = `select * from \`${tableName}\``
            if (condition) {
                query += condition
            }
            console.log(query);
            try {
                let row = db.exec(query)
                if (row !== undefined && row.length > 0) {
                    let data = _rowsFromSqlDataObject(row[0], 'Array')
                    resolve({
                        code: 0,
                        data: data
                    })
                } else {
                    resolve({
                        code: 0,
                        data: []
                    })
                }
            } catch (error) {
                console.log('model.getList', error.message);
                reject({
                    code: 1,
                    data: null,
                    msg: error.message
                })
            } finally {
                dbClose(db, window.dbPath)
            }
        }
    })
}


// 新增事项
export const addMaster = (obj) => {
    return new Promise(async (resolve, reject) => {
        saveFormData({
            tableName: 'note_master',
            keyValue: {
                columns: ['master_name', 'status', 'create_time'],
                values: [obj.master_name, obj.status, Date.now()]
            }
        }).then(() => {
            resolve()
        }).catch(err => {
            reject(err)
        })
    })
}

// 新增分类
export const addClass = (obj) => {
    return new Promise(async (resolve, reject) => {
        saveFormData({
            tableName: 'note_class',
            keyValue: {
                columns: ['name', 'create_time'],
                values: [obj.name, Date.now()]
            }
        }).then(() => {
            resolve()
        }).catch(err => {
            reject(err)
        })
    })
}
// 更新分类
export const updateClass = (obj) => {
    return new Promise(async (resolve, reject) => {
        updateFormData({
            tableName: 'note_class',
            keyValue: {
                columns: ['id','name','update_time'],
                values: [obj.id, obj.name, Date.now()]
            },
            primaryKey: 'id'
        }).then(() => {
            resolve()
        }).catch(err => {
            reject(err)
        })
    })
}
// 更新事项
export const updateMaster = (obj) => {
    return new Promise(async (resolve, reject) => {
        let values = [[],[]]
        Object.keys(obj).forEach(key => {
            if (obj[key]!==null) {
                values[0].push(key)
                values[1].push(obj[key])
            }
        })
        updateFormData({
            tableName: 'note_master',
            keyValue: {
                columns: [...values[0],'update_time'],
                values: [...values[1], Date.now()]
            },
            primaryKey: 'id'
        }).then(() => {
            resolve()
        }).catch(err => {
            reject(err)
        })
    })
}

export const getClassList = async () => {
    let res =  getList('note_class')
    return Promise.resolve(res)
}
export const getMasterList = async (obj) => {
    const {status, orderProp} = obj
    let condition = ` where status=${status}`
    if (orderProp) {
        condition += ` order by ${orderProp} desc`
    }
    let res = getList('note_master', condition)
    return Promise.resolve(res)
}
