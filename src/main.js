function divideTags(tags) {
    var result = [];
    tags.forEach(function (tag) {
        var tagInfo = tag.split('-');
        var tagObject = {
            barcode : tagInfo[0],
            count : parseInt(tagInfo[1]) || 1
        };
        result.push(tagObject);
    });
    return result;
}

function buildItems(tags, items) {
    var results = [];

    tags.forEach(function (tag) {
        var existItem = results.find(function (item) {
            return tag.barcode === item.barcode;
        });

        if (!existItem){
            var itemModel = items.find(function (item) {
                return tag.barcode === item.barcode;
            });

            existItem = Object.assign({
                count : 0
            },itemModel);
            results.push(existItem);
        }
        existItem.count += tag.count;
    });
    console.debug(results);
    return results;
}

function calculateSubtotal(cartItems){
    var result = [];

    cartItems.forEach(function (item) {
        var subtotal = item.price * item.count;
        var object = Object.assign({
            subtotal : subtotal
        },item);
        result.push(object);
    });

    return result;
}

function promotionBuyTwoGetOneFree(promotion, items) {
    promotion.barcodes.forEach(function (barcode) {
        var object = items.find(function (item) {
            return item.barcode === barcode;
        });
        if (object) {
            object.count -= parseInt(object.count / 3);
            object.subtotal = object.count * object.price;
        }
    })
}

function applyPromotions(items,promotionsArray){
    var newItems = items.map(function (element) {
        return Object.assign({
            originCount : element.count
        },element);
    });

    promotionsArray.forEach(function (promotion) {
        if (promotion.type === 'BUY_TWO_GET_ONE_FREE'){
            promotionBuyTwoGetOneFree(promotion, newItems);
        }
    });
    return newItems;
}

function calculateTotalPrice(cartItems){
    var result = 0;
    cartItems.forEach(function (item) {
        result += item.subtotal;
    });
    return result;
}

function generateFreeItems(originalCartItems,promotionItems) {
    var results = originalCartItems.map(function (originalItem) {
        var promotionItem = promotionItems.find(function (item) {
            return originalItem.barcode === item.barcode;
        });
        originalItem.count -= promotionItem.count;
        originalItem.subtotal = originalItem.count * originalItem.price;
        return originalItem;
    });

    results = results.filter(function (item) {
        return item.count > 0;
    });
    return results;
}

function generateTime() {
    var result = null;
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
        result = year + '年' + month + '月' + date + '日 ' + hour + ':' + minute + ':' + second;
    return result;
}
function printShoppingList(discountCartItems,freeItems,total,saved) {
    var formattedDateString = generateTime();
    var printText = '***<没钱赚商店>购物清单***\n' +
                    '打印时间：' + formattedDateString + '\n' +
                    '----------------------\n';
    discountCartItems.forEach(function (cartItem) {
        printText += `名称：${cartItem.name}，数量：${cartItem.originCount}${cartItem.unit}，` +
                     `单价：${cartItem.price.toFixed(2)}(元)，小计：${cartItem.subtotal.toFixed(2)}(元)\n`;
    });
    printText += '----------------------\n' +
                 '挥泪赠送商品：\n';
    freeItems.forEach(function (freeItem) {
        printText += `名称：${freeItem.name}，数量：${freeItem.count}${freeItem.unit}\n`;
    });
    printText += '----------------------\n' +
                 `总计：${total.toFixed(2)}(元)\n` +
                 `节省：${saved.toFixed(2)}(元)\n` +
                 '**********************';
    console.log(printText);
}

function printInventory(inputs) {
    var tags = divideTags(inputs);
    var items = buildItems(tags,loadAllItems());
    var itemsHasSubtotal = calculateSubtotal(items);
    var promotionItems = applyPromotions(itemsHasSubtotal,loadPromotions());
    var pay = calculateTotalPrice(promotionItems);
    var freeItems = generateFreeItems(itemsHasSubtotal,promotionItems);
    var saved = calculateTotalPrice(freeItems);
    printShoppingList(promotionItems,freeItems,pay,saved);
}