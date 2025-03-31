// Variables globales
const productList = document.getElementById('product-list');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const searchInput = document.getElementById('searchInput');
let products = [];
let cart = [];

// Cargar productos desde la API
async function loadProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Mostrar productos en la página
function displayProducts(productsToShow) {
    productList.innerHTML = '';
    productsToShow.forEach(product => {
        const card = `
            <div class="col-md-4 col-sm-6 mb-4">
                <div class="card">
                    <img src="${product.image}" class="card-img-top" alt="${product.title}">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text">$${product.price}</p>
                        <button class="btn btn-primary add-to-cart" data-id="${product.id}">Añadir al carrito</button>
                    </div>
                </div>
            </div>
        `;
        productList.innerHTML += card;
    });

    // Añadir eventos a los botones
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => showQuantityModal(button.dataset.id));
    });
}

// Mostrar modal de cantidad
function showQuantityModal(productId) {
    const product = products.find(p => p.id == productId);
    document.getElementById('modalProductName').textContent = product.title;
    const modal = new bootstrap.Modal(document.getElementById('quantityModal'));
    modal.show();

    document.getElementById('addToCartBtn').onclick = () => {
        const quantity = parseInt(document.getElementById('quantityInput').value);
        addToCart(product, quantity);
        modal.hide();
    };
}

// Añadir al carrito
function addToCart(product, quantity) {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ product, quantity });
    }
    updateCart();
}

// Actualizar carrito
function updateCart() {
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.product.price * item.quantity;
        total += itemTotal;
        cartItems.innerHTML += `
            <tr>
                <td>${item.product.title}</td>
                <td>${item.quantity}</td>
                <td>$${item.product.price}</td>
                <td>$${itemTotal.toFixed(2)}</td>
            </tr>
        `;
    });
    cartTotal.textContent = total.toFixed(2);
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Búsqueda dinámica
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.title.toLowerCase().includes(searchTerm) || 
        product.category.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
});

// Generar factura en PDF
document.getElementById('processPaymentBtn').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.text('Factura de Compra', 10, 10);
    let y = 20;
    cart.forEach(item => {
        doc.text(`${item.product.title} - ${item.quantity} x $${item.product.price} = $${(item.product.price * item.quantity).toFixed(2)}`, 10, y);
        y += 10;
    });
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    doc.text(`Total: $${total.toFixed(2)}`, 10, y + 10);
    doc.save('factura.pdf');

    // Reiniciar carrito
    cart = [];
    updateCart();
    bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
    bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
});

// Cargar productos al iniciar
loadProducts();