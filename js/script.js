const coffees = [
  { id: 1, name: "Expresso", price: 5.00, image: "image/Expresso.jpeg", rating: 4 },
  { id: 2, name: "Cappuccino", price: 7.50, image: "image/Capuccino.jpeg", rating: 5 },
  { id: 3, name: "Latte", price: 6.50, image: "image/Latte.jpeg", rating: 3 },
  { id: 4, name: "Mocha", price: 8.00, image: "image/Mocha.jpeg", rating: 4 }
];

let cart = [];
let orderHistory = [];
let chatMessages = []; 

document.addEventListener("DOMContentLoaded", () => {
  loadCoffees();
  loadOrderHistory();
  document.getElementById("search-bar").addEventListener("input", searchCoffee);
  document.getElementById("filter-price").addEventListener("change", filterByPrice);

  document.getElementById("send-message").addEventListener("click", sendMessage);

  document.getElementById("supportModal").addEventListener("show.bs.modal", loadChatMessages);
});

function loadCoffees() {
  const coffeeList = document.getElementById("coffee-list");
  coffeeList.innerHTML = "";
  coffees.forEach(coffee => {
      const coffeeCard = document.createElement("div");
      coffeeCard.classList.add("col-md-3");
      coffeeCard.innerHTML = `
          <div class="card text-center p-2">
              <img src="${coffee.image}" class="card-img-top" alt="${coffee.name}">
              <div class="card-body">
                  <h5 class="card-title">${coffee.name}</h5>
                  <p class="card-text">R$ ${coffee.price.toFixed(2)}</p>
                  <p class="card-text">⭐ ${"★".repeat(coffee.rating)}${"☆".repeat(5 - coffee.rating)}</p>
                  <button class="btn btn-primary" onclick="addToCart(${coffee.id})">Adicionar</button>
              </div>
          </div>
      `;
      coffeeList.appendChild(coffeeCard);
  });
}

function searchCoffee() {
  const searchTerm = document.getElementById("search-bar").value.toLowerCase();
  const filteredCoffees = coffees.filter(coffee => coffee.name.toLowerCase().includes(searchTerm));
  loadFilteredCoffees(filteredCoffees);
}

function filterByPrice() {
  const priceLimit = parseFloat(document.getElementById("filter-price").value);
  const filteredCoffees = coffees.filter(coffee => coffee.price <= priceLimit);
  loadFilteredCoffees(filteredCoffees);
}

function loadFilteredCoffees(filteredCoffees) {
  const coffeeList = document.getElementById("coffee-list");
  coffeeList.innerHTML = "";
  filteredCoffees.forEach(coffee => {
      const coffeeCard = document.createElement("div");
      coffeeCard.classList.add("col-md-3");
      coffeeCard.innerHTML = `
          <div class="card text-center p-2">
              <img src="${coffee.image}" class="card-img-top" alt="${coffee.name}">
              <div class="card-body">
                  <h5 class="card-title">${coffee.name}</h5>
                  <p class="card-text">R$ ${coffee.price.toFixed(2)}</p>
                  <p class="card-text">⭐ ${"★".repeat(coffee.rating)}${"☆".repeat(5 - coffee.rating)}</p>
                  <button class="btn btn-primary" onclick="addToCart(${coffee.id})">Adicionar</button>
              </div>
          </div>
      `;
      coffeeList.appendChild(coffeeCard);
  });
}

function addToCart(id) {
  const coffee = coffees.find(c => c.id === id);
  const item = cart.find(i => i.id === id);
  if (item) {
      item.quantity++;
  } else {
      cart.push({ ...coffee, quantity: 1 });
  }
  updateCart();
}

function updateCart() {
  const cartList = document.getElementById("cart");
  const totalPrice = document.getElementById("total-price");
  cartList.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
      total += item.price * item.quantity;
      const cartItem = document.createElement("li");
      cartItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
      cartItem.innerHTML = `
          ${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}
          <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">Remover</button>
      `;
      cartList.appendChild(cartItem);
  });
  totalPrice.textContent = `R$ ${total.toFixed(2)}`;
}

function removeFromCart(id) {
  const index = cart.findIndex(item => item.id === id);
  if (index !== -1) {
      cart.splice(index, 1);
  }
  updateCart();
}

function clearCart() {
  cart = [];
  updateCart();
}

function openModal() {
  if (cart.length === 0) {
      showToast("Seu carrinho está vazio!");
      return;
  }

  const modal = new bootstrap.Modal(document.getElementById("checkoutModal"));

  // Preenche o total e a data no modal
  document.getElementById("modal-total").textContent = `R$ ${calculateTotal().toFixed(2)}`;
  document.getElementById("modal-date").textContent = new Date().toLocaleString();

  modal.show();
}

function calculateTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function finalizeOrder() {
  const address = document.getElementById("deliveryAddress").value;
  const paymentMethod = document.getElementById("paymentMethod").value;

  if (!address) {
      showToast("Por favor, digite seu endereço de entrega.");
      return; 
  }

  if (!paymentMethod) {
      showToast("Por favor, selecione um método de pagamento.");
      return; 
  }

  showToast("Pedido finalizado com sucesso!");
  orderHistory.push({ cart, address: address, paymentMethod: paymentMethod, date: new Date() }); 
  loadOrderHistory();
  cart = [];
  updateCart();

  const modal = bootstrap.Modal.getInstance(document.getElementById("checkoutModal")); 
  modal.hide(); 

  document.getElementById("deliveryAddress").value = "";
  document.getElementById("paymentMethod").value = "Dinheiro"; 
}

function loadOrderHistory() {
  const orderList = document.getElementById("order-history");
  orderList.innerHTML = "";
  orderHistory.forEach(order => {
      const orderItem = document.createElement("li");
      orderItem.classList.add("list-group-item");
      orderItem.innerHTML = `
          Pedido de ${order.date.toLocaleString()} - Total: R$ ${calculateOrderTotal(order).toFixed(2)}<br>
          Endereço: ${order.address}<br>
          Pagamento: ${order.paymentMethod}
      `;
      orderList.appendChild(orderItem);
  });
}

function calculateOrderTotal(order) {
  return order.cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function openChat() {
  const supportModal = new bootstrap.Modal(document.getElementById("supportModal"));
  supportModal.show();
}

function showToast(message) {
  const toastElement = document.getElementById('liveToast');
  const toastBody = toastElement.querySelector('.toast-body');
  toastBody.textContent = message;
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

// Funções para o Chat de Suporte

function sendMessage() {
  const messageInput = document.getElementById("message-input");
  const messageText = messageInput.value.trim();

  if (messageText !== "") {
      chatMessages.push({ sender: "user", text: messageText });

      messageInput.value = "";

      // Simula uma resposta do suporte (apenas para teste)
      setTimeout(() => {
          chatMessages.push({ sender: "support", text: "Obrigado pela sua mensagem! Entraremos em contato em breve." });
          loadChatMessages(); 
      }, 1000); 

      loadChatMessages();
  }
}

function loadChatMessages() {
  const chatBody = document.getElementById("chat-body");
  chatBody.innerHTML = ""; 

  chatMessages.forEach(message => {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message", message.sender);

      const messageText = document.createElement("p");
      messageText.textContent = message.text;

      messageDiv.appendChild(messageText);
      chatBody.appendChild(messageDiv);
  });

  chatBody.scrollTop = chatBody.scrollHeight;
}