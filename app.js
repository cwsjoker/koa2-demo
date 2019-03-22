const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
// const session = require('koa-generic-session');
// const Redis = require('koa-redis');
// const pv = require('./middleware/koa_pv')
const jwt = require('koa-jwt')

const index = require('./routes/index')
const users = require('./routes/users')


const mongoose = require('mongoose');
const dbConfig = require('./dbs/config')

const res_formatter = require('./middleware/res_formatter')

// error handler
onerror(app)

// app.keys=['keys', 'keys'];
// app.use(session({
//   key: 'mt',
//   prefix: 'mtpr',
//   store: new Redis()
// }))

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
// app.use(pv())
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))



// 处理options请求
const handler = async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', 'http://localhost:3001');
  // 允许设置请求字段
  ctx.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, token");
  // log request URL:
  // ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, PATCH");
  // ctx.set("Access-Control-Max-Age", "3600");
  // ctx.set("Access-Control-Allow-Credentials", "true");
  if (ctx.request.method == "OPTIONS") {
    ctx.response.status = 200
  }
  try {
    await next();
  } catch (err) {
    ctx.response.status = err.statusCode || err.status || 500;
    ctx.response.body = {
      message: err.message
    };
  }
};

app.use(res_formatter())

app.use(handler);

app.use(function(ctx, next){
  if (ctx.request.method == "OPTIONS") {
    return;
  } else {
    return next().catch((err) => {
        if (401 == err.status) {
            ctx.status = 401;
            ctx.body = 'Protected resource, use Authorization header to get access\n';
        } else {
            throw err;
        }
    });
  }
});

app.use(jwt({secret: 'my_token'}).unless({
  path: [
    /\/users\/getPerson/,
    /\/users\/addPerson/,
    /\/users\/updatePerson/,
    /\/users\/removePerson/,
    /\/users\/login/,
    /\/users\/register/,
    /\/users\/person/
  ]
}))


// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
mongoose.connect(dbConfig.dbs, {
  useNewUrlParser: true
})

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
