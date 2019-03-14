function res_formatter(ctx) {
    if (ctx.request.method == "OPTIONS") {
        return;
    }
    if (ctx.body.code === 0) {
        ctx.body = {
            code: 0,
            msg: ctx.body.msg || '操作成功',
            data: ctx.body.data || null,
            success: true
        }
    } else {
        ctx.body = {
            code: ctx.body.code,
            msg: trans_code(ctx.body.code) || '操作失败',
            success: false
        }
    }
}

function trans_code(code) {
    let msg = '';
    switch (code) {
        case -1:
            msg = '操作失败'
            break
        case 101:
            msg = '账号或密码错误'
            break
        case 102:
            msg = '用户名重复'
            break
        case 103:
            msg = '缺少必要字段'
            break
        case 104:
            msg = '缺少id'
            break
        case 105:
            msg = '两次密码不等'
            break
        default:
            msg = '操作失败'
            break
    }
    return msg
}

module.exports = function() {
    return async function(ctx, next) {
        try {
            await next();
        } catch (error) {
            console.log(error);
        }
        res_formatter(ctx);
    }
}