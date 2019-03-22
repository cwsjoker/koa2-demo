const router = require('koa-router')()
const Person = require('../dbs/models/person')
const User = require('../dbs/models/user')
const jwt = require('jsonwebtoken')

// const Redis = require('koa-redis')

// const Store = new Redis().client

router.prefix('/users')

// router.get('/fix', async function(ctx, next) {
//   const st = await Store.hset('fix', 'name', Math.random());
//   ctx.body = {
//     code: 0
//   }
// })


// 需要jwt

// 注册
router.post('/register', async (ctx, next) => {
  const { username, password, repassword } = ctx.request.body;
  if (username && password && repassword) {
    if (password !== repassword) {
      ctx.body = {
        code: 104
      }
    } else {
      const data = await User.findOne({'userName': username})
      if (data) {
        ctx.body = {
          code: 102,
        }
      } else {
        const user = new User({
          userName: username,
          userPwd: password
        })
        try {
          await user.save()
          ctx.body = {
            code: 0
          }
        } catch (error) {
          ctx.body = {
            code: -1,
          }
        }
      }
    }
  } else {
    ctx.body = {
      code: 103,
    }
  }
})

// 登录
router.post('/login', async (ctx, next) => {
  const { username, password } = ctx.request.body
  const data = await User.findOne({
    'userName': username,
    'userPwd': password
  }).select('_id userName')
  if (data) {
    const token = jwt.sign({
      name: data.userName,
      _id: data._id
    }, 'my_token', { expiresIn: '1h' })
    ctx.body = {
      code: 0,
      data: {
        userName: data.userName,
        _id: data._id,
        token
      }
    }
  } else {
    ctx.body = {
      code: 101
    }
  }
})

// 增加用户的历史


// 查询用户的信息
router.get('/getHistoryList', async (ctx, next) => {
  const token = ctx.header.authorization;
  if (token) {
    const lod = jwt.verify(token.split(' ')[1], 'my_token');
    const data = await User.findOne({'userName': lod.name}).select('historyList')
    // console.log(data);
    ctx.body = {
      code: 0,
      data: data.historyList
    }
  }
})


// 添加历史人物表
router.post('/addHistory', async (ctx, next) => {
  const token = ctx.header.authorization;
  const { name, forceVal, age, note } = ctx.request.body
  if (token) {
    const lod = jwt.verify(token.split(' ')[1], 'my_token');
    const id = new Date().getTime().toString();
    // await User.where({
    //   _id: lod._id
    // }).update({
    //   $push: {
    //     'historyList': {
    //       hid: id,
    //       name,
    //       forceVal,
    //       age,
    //       note
    //     }
    //   }
    // })
    await User.update({
      _id: lod._id
    }, {
      $push: {
        'historyList': {
          hid: id,
          name,
          forceVal,
          age,
          note
        }
      }
    })
    ctx.body = {
      code: 0
    }
  }
})




// 测试没有jwt

// 获取
router.get('/person', async function(ctx, next) {
    const { name, ...params } = ctx.request.query;
    const reg = new RegExp(name)
    const query = name ? {
      name: {$regex : reg},
      ...params
    } : {
      ...params
    }
    const data = await Person.find(query).select('_id name age')
    ctx.body = {
      code: 0,
      data
    }
})

// 增加
router.post('/person', async function(ctx, next) {
  const { name } = ctx.request.body
  if (name) {
    const data = await Person.findOne({'name': name})
    if (data) {
      ctx.body = {
        code: 102,
      }
    } else {
        const person = new Person({
          ...ctx.request.body
        })
        try {
          await person.save()
          ctx.body = {
            code: 0
          }
        } catch (error) {
          ctx.body = {
            code: -1,
          }
        }
    }
  } else {
    ctx.body = {
      code: 103,
    }
  }
})

// 更新
router.patch('/person', async function(ctx, next) {
  const { id, ...params } = ctx.request.body;
    if (id) {
      await Person.where({
        _id: id
      }).update({
        ...params
      })
      ctx.body = {
        code: 0
      }
    } else {
      ctx.body = {
        code: 104,
      }
    }
})

// 删除
router.delete('/person', async function(ctx, next) {
  // const { id } = ctx.request.body
  const { id } = ctx.request.query
  if (id) {
    await Person.where({
      _id: id
    }).remove()
    ctx.body = {
      code: 0
    }
  } else {
    ctx.body = {
      code: 104,
    }
  }
})

module.exports = router
