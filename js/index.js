let menu = document.getElementById("menu");
let navlist = document.querySelector(".navlist");

menu.addEventListener("click", () => {
  menu.classList.toggle("fa-times");
  navlist.classList.toggle("show");
});
window.addEventListener("scroll", () => {
  menu.classList.remove("fa-times");
  navlist.classList.remove("show");
});
window.addEventListener("resize", () => {
  menu.classList.remove("fa-times");
  navlist.classList.remove("show");
});

/* ================== End menu ================== */
const backDrop = document.querySelector(".backdrop");
const cartBtn = document.querySelector(".cart_shop");
const cartModal = document.querySelector(".cart");
const closeModal = document.querySelector(".cart-item-confirm");

cartBtn.addEventListener("click", showModalFunction);
closeModal.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);

function showModalFunction() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "20%";
}

function closeModalFunction() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100%";
}
/* ================== End modal ================== */

import { productsData } from "./products.js";
const productsDom = document.querySelector(".products__center");
const number = new Intl.NumberFormat("en-US", { style: "decimal" });
const cartitems = document.querySelector(".cart-items");
const carttotal = document.querySelector(".cart-total");
const cartcontent = document.querySelector(".cart-content");
const cleaCart = document.querySelector(".clear-cart");
let cart = [];
let buttonsDom = [];

class Products {
  getProducts() {
    return productsData;
  }
}
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
      <div class="product">
      <div class="images">
        <img src=${product.imageUrl} alt="" />
      </div>
      <h2 class="title">${product.title}</h2>
      <div class="desc">
        <button class="add-to-cart fa-solid fa-cart-shopping" data-id=${
          product.id
        }>
        </button>
        <h3 class="price">${number.format(product.price)} تومان</h3>
      </div>
    </div>
      `;
      productsDom.innerHTML = result;
    });
  }
  getAddToCartBtns() {
    const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
    buttonsDom = addToCartBtns;

    addToCartBtns.forEach((btn) => {
      const id = btn.dataset.id;
      const isInCart = cart.find((p) => parseInt(p.id) === parseInt(id));
      if (isInCart) {
        btn.disabled = true;
        btn.classList = "add-to-cart fa-solid fa-cart-plus";
      }

      btn.addEventListener("click", (event) => {
        event.target.disabled = true;
        event.target.classList = "add-to-cart fa-solid fa-cart-plus";
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
        cart = [...cart, addedProduct];
        Storage.saveCart(cart);
        this.setCartValue(cart);
        this.addCartItem(addedProduct);
      });
    });
  }
  setCartValue(cart) {
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);
    carttotal.innerText = `هزینه کل ${number.format(totalPrice)} تومان`;

    cartitems.innerText = tempCartItems;
  }
  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
  <img class="cart-item-img" src=${cartItem.imageUrl} />
  <div class="cart-item-desc">
    <h4>${cartItem.title}</h4>
    <h5>${number.format(cartItem.price)} تومان</h5>
  </div>
  <div class="cart-item-conteoller">
    <i class="fa fa-chevron-up" data-id=${cartItem.id}></i>
    <p>${cartItem.quantity}</p>
    <i class='fa fa-chevron-down' data-id=${cartItem.id}></i>
  </div>
  <i class="fa-solid fa-trash-can" data-id=${cartItem.id}></i>
  `;
    cartcontent.appendChild(div);
  }
  setupApp() {
    //cart = Storage.getCart() || [];
    cart = Storage.getCart();
    cart.forEach((item) => this.addCartItem(item));
    this.setCartValue(cart);
  }
  cartLogic() {
    cleaCart.addEventListener("click", () => {
      this.clearCart();
    });

    cartcontent.addEventListener("click", (event) => {
      if (event.target.classList.contains("fa-trash-can")) {
        /*       const removeItem = event.target;
        const id = removeItem.dataset.id;
        cartcontent.removeChild(removeItem.parentElement);
        this.removeItem(id);  */
        ///////////////////////////////////////////////////////
        const removeItem = event.target;
        const _removedItem = cart.find((c) => c.id == removeItem.dataset.id);
        this.removeItem(_removedItem.id);
        Storage.saveCart(cart);
        cartcontent.removeChild(removeItem.parentElement);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        const addQuantity = event.target;
        const id = addQuantity.dataset.id;
        const addedItem = cart.find((c) => c.id == id);
        addedItem.quantity++;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        const subQuantity = event.target;
        const id = subQuantity.dataset.id;
        const substractedItem = cart.find((c) => c.id == id);

        if (substractedItem.quantity === 1) {
          this.removeItem(substractedItem.id);
          cartcontent.removeChild(subQuantity.parentElement.parentElement);
          return;
        }
        substractedItem.quantity--;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        subQuantity.previousElementSibling.innerText = substractedItem.quantity;
      }
    });
  }
  clearCart() {
    cart.forEach((cItem) => {
      this.removeItem(cItem.id);
    });
    while (cartcontent.children.length) {
      cartcontent.removeChild(cartcontent.children[0]);
    }
    closeModalFunction();
  }
  removeItem(id) {
    cart = cart.filter((cItem) => cItem.id !== id);
    this.setCartValue(cart);
    Storage.saveCart(cart);
    this.getSingleButton(id);
    const button = this.getSingleButton(id);
    button.disabled = false;
    button.classList = "add-to-cart fa-solid fa-cart-shopping";
  }
  getSingleButton(id) {
    return buttonsDom.find((btn) => parseInt(btn.dataset.id) === parseInt(id));
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id == id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
    /*  return JSON.parse(localStorage.getItem("cart")); */
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const productsData = products.getProducts();
  const ui = new UI();
  ui.displayProducts(productsData);
  ui.setupApp();
  ui.getAddToCartBtns();
  ui.cartLogic();
  Storage.saveProducts(productsData);
});
