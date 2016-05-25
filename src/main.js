function divideTags(tags) {
    var result = [];
    tags.forEach(function (tag) {
        var stringArray = tag.split('-');
        var object = {};
        object.barcode = stringArray[0];
        object.count = parseInt(stringArray[1])||1;
        result.push(object);
    })
    return result;
}
function transferCartItems(tags,items) {
    var result = [];
    tags.forEach(function (tag) {
        var exitItem = result.find(function (item) {
            return tag.barcode === item.barcode;
        });
        if (!exitItem){
            var object = items.find(function (item) {
                return tag.barcode === item.barcode;
            });
            exitItem = Object.assign({
                count : 0
            },object);
            result.push(exitItem);
        }
        exitItem.count += tag.count;
    })
    return result;
}
function calculateSubTotal(cartItems){
    var result = [];
    cartItems.forEach(function (item) {
        var subTotal = item.price * item.count;
        var object = Object.assign({
            subTotal : subTotal,
        },item);
        result.push(object);
    });
    return result;
}
function applyPromotions(cartItems,promotionsArray){
    var result = cartItems.map(function (element) {
        return Object.assign({
            originCount : element.count
    },element);
    });
    promotionsArray.forEach(function (promotion) {
        if (promotion.type === 'BUY_TWO_GET_ONE_FREE'){
            promotion.barcodes.forEach(function (barcode) {
                var object = result.find(function(item){
                    return item.barcode === barcode;
                });
                if (object){
                    object.count -= parseInt(object.count/3);
                    object.subTotal = object.count * object.price;
                }
            })
        }
    });
    return result;
}
function calculateTotal(cartItems){
    var result = 0;
    cartItems.forEach(function (item) {
        result += item.subTotal;
    });
    return result;
}
function generateFreeItems(originalCartItems,discountCartItems) {
    var result = [];
    for(var i = 0,len = originalCartItems.length;i < len;i++){
        if(originalCartItems[i].count != discountCartItems[i].count){
            var object = {};
            object.name = originalCartItems[i].name;
            object.unit = originalCartItems[i].unit;
            object.freecount = originalCartItems[i].count - discountCartItems[i].count;
            object.subTotal = originalCartItems[i].price * object.freecount;
            result.push(object);
        }
    }
    return result;
}
function printShoppingList(discountCartItems,freeItems,total,saved) {
    var dateDigitToString = function (num) {
        return num < 10 ? '0' + num : num;
    };
    var currentDate = new Date(),
        year = dateDigitToString(currentDate.getFullYear()),
        month = dateDigitToString(currentDate.getMonth() + 1),
        date = dateDigitToString(currentDate.getDate()),
        hour = dateDigitToString(currentDate.getHours()),
        minute = dateDigitToString(currentDate.getMinutes()),
        second = dateDigitToString(currentDate.getSeconds()),
        formattedDateString = year + '年' + month + '月' + date + '日 ' + hour + ':' + minute + ':' + second;
    var printText = '***<没钱赚商店>购物清单***\n' +
                    '打印时间：' + formattedDateString + '\n' +
                    '----------------------\n';
    discountCartItems.forEach(function (cartItem) {
        printText += `名称：${cartItem.name}，数量：${cartItem.originCount}${cartItem.unit}，` +
                     `单价：${cartItem.price.toFixed(2)}(元)，小计：${cartItem.subTotal.toFixed(2)}(元)\n`;
    });
    printText += '----------------------\n' +
                 '挥泪赠送商品：\n';
    freeItems.forEach(function (freeItem) {
        printText += `名称：${freeItem.name}，数量：${freeItem.freecount}${freeItem.unit}\n`;
    });
    printText += '----------------------\n' +
                 `总计：${total.toFixed(2)}(元)\n` +
                 `节省：${saved.toFixed(2)}(元)\n` +
                 '**********************';
    console.log(printText);
}

function printInventory(inputs) {
    var tags = divideTags(inputs);
    var mergeCartItems = transferCartItems(tags,loadAllItems());
    var originalCartItems = calculateSubTotal(mergeCartItems);
    var discountCartItems = applyPromotions(originalCartItems,loadPromotions());
    var total = calculateTotal(discountCartItems);
    var freeItems = generateFreeItems(originalCartItems,discountCartItems);
    var saved = calculateTotal(freeItems);
    printShoppingList(discountCartItems,freeItems,total,saved);
}