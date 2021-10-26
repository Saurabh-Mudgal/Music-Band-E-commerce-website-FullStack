if (document.readyState == 'loading'){
    document.addEventListener('DOMContentLoaded', ready)
} else{
    ready()
}

function ready(){
    let removeButton = document.getElementsByClassName("btn-danger")

    for (let i=0; i < removeButton.length; i++){
        let btn = removeButton[i]
        btn.addEventListener("click", removeCartItem)
    }

    let quantityInputElements = document.getElementsByClassName('cart-quantity-input')

    for(let i = 0; i < quantityInputElements.length; i++){
        input = quantityInputElements[i]
        input.addEventListener('change', quantityChanged)
    }

    let addToCartElements = document.getElementsByClassName('shop-item-button')

    for(let i = 0; i < addToCartElements.length; i++){
        purchase = addToCartElements[i]
        purchase.addEventListener('click', addToCartClick)
    }

    let purchaseButton = document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked)
}

let stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    locale: 'auto',
    token: function(token){
        let items = []
        let cartItemContainer = document.getElementsByClassName('cart-items')[0]
        let cartRows = cartItemContainer.getElementsByClassName('cart-row')

        for(let i = 0; i < cartRows.length; i++){
            let cartRow = cartRows[i]
            let quantityElement = cartRow.getElementsByClassName('cart-quantity-input')
            let quantity = quantityElement.value
            let id = cartRow.dataset.itemId
            items.push({
                id: id,
                quantity: quantity
            })
        }

        fetch('/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                stripeTokenId: token.id,
                items: items
            })
        }).then(function(res){
            return res.json()
        }).then(function(data){
            successfulPurchase(data)
        }).catch(function(error){
            console.error(error)
        })
    }
})

function successfulPurchase(data){   
    alert(data.message)

    let cartItems = document.getElementsByClassName('cart-items')[0]

    while(cartItems.hasChildNodes()){
        cartItems.removeChild(cartItems.firstChild)
    }
    updateCartTotal()
}

function purchaseClicked(){
    let price = parseFloat(document.getElementsByClassName('cart-total-price')[0].innerText.replace('$', '')) * 100
    stripeHandler.open({
        amount: price
    })   
}

function addToCartClick(event){
    cartButton = event.target
    shopItem = cartButton.parentElement.parentElement

    let title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    let price = parseFloat(shopItem.getElementsByClassName('shop-item-price')[0].innerText.replace('$', ''))
    let imageSRC = shopItem.getElementsByClassName('shop-item-image')[0].src
    let id = shopItem.dataset.itemId

    addItemToCart(title, price, imageSRC, id)
    updateCartTotal()

}

function addItemToCart(title, price, imageSRC, id){
    let cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    cartRow.dataset.itemId = id

    let cartItems = document.getElementsByClassName('cart-items')[0]
    let cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for(let i = 0; i < cartItemNames.length; i++){
        if(cartItemNames[i].innerText == title){
            alert('This item is already in cart. You have increased quantity by 1.')
            cartItemQuantity = cartItems.getElementsByClassName('cart-quantity-input')
            cartItemQuantity[i].value = parseFloat(cartItemQuantity[i].value) + 1
            return
        }
    }

    let cartRowContent = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSRC}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">$${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`
    cartRow.innerHTML = cartRowContent
    
    cartItems.append(cartRow)
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged)
}

function quantityChanged(event){
    let inputNum = event.target

    if(isNaN(inputNum.value) || inputNum.value <= 0){
        inputNum.value = 1
    }
    updateCartTotal()
}

function removeCartItem(event){
    let btnClicked = event.target
    btnClicked.parentElement.parentElement.remove()
    updateCartTotal()
}

function updateCartTotal(){
    let cartItemContainer = document.getElementsByClassName('cart-items')[0]
    let cartRows = cartItemContainer.getElementsByClassName('cart-row')

    total = 0

    for(var i = 0; i < cartRows.length; i++){
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        let price = parseFloat(priceElement.innerText.replace('$', ''))
        let quantity = quantityElement.value
        total += (price*quantity)
    }
    total = Math.round((total + Number.EPSILON) * 100) / 100
    total = total.toFixed(2)

    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total
}