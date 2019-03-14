function pv(ctx) {
    ctx.session.count++;
    global.console.log(ctx.session.count);
    global.console.log('path' + ctx.path);
}

module.exports = function() {
    return async function(ctx, next) {
        pv(ctx);
        // 当前中间件处理完毕请交给下一个中间件处理
        await next();
    }
}