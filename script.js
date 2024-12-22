// script.js 
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const productsContainer = document.getElementById('products-container');
    const cartBtn = document.getElementById('cart-btn');
    const cartCount = document.getElementById('cart-count');
    const contactForm = document.getElementById('contact-form');

    // Estado del carrito
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Crear modal del carrito
    const cartModal = document.createElement('div');
    cartModal.className = 'cart-modal';
    document.body.appendChild(cartModal);

    // Fetch productos de la API 
    async function fetchProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            productsContainer.innerHTML = '<p>Error al cargar los productos</p>';
        }
    }

    // Mostrar productos
    function displayProducts(products) {
        productsContainer.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.title}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-price">$${product.price}</p>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        Añadir al carrito
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Toggle carrito
    window.toggleCart = () => {
        cartModal.classList.toggle('show');
        updateCartModal();
    }

    // Actualizar modal del carrito
    function updateCartModal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        cartModal.innerHTML = `
            <div class="cart-modal-header">
                <h3>Carrito de Compras</h3>
                <button onclick="toggleCart()" style="color: white; background: none; border: none;">&times;</button>
            </div>
            <div class="cart-modal-body">
                ${cart.length === 0 ? '<p>El carrito está vacío</p>' : 
                cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="cart-item-info">
                            <h4>${item.title}</h4>
                            <p>$${item.price}</p>
                            <div class="cart-item-quantity">
                                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                                <button class="remove-item" onclick="removeFromCart(${item.id})">🗑️</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-modal-footer">
                <div class="cart-total">Total: $${total.toFixed(2)}</div>
                <button class="btn btn-primary w-100" onclick="checkout()">Finalizar Compra</button>
            </div>
        `;
    }

    // Añadir al carrito
    window.addToCart = async (productId) => {
        try {
            const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
            const product = await response.json();
            
            const existingItem = cart.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            
            cartBtn.classList.add('cart-animation');
            setTimeout(() => {
                cartBtn.classList.remove('cart-animation');
            }, 500);

            updateCart();
            saveCart();
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    }

    // Actualizar carrito
    function updateCart() {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        updateCartModal();
    }

    // Actualizar cantidad
    window.updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }

        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            updateCart();
            saveCart();
        }
    }

    // Remover del carrito
    window.removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
        saveCart();
    }

    // Guardar carrito en localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Checkout
    window.checkout = () => {
        if (cart.length === 0) {
            alert('El carrito está vacío');
            return;
        }
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        alert(`Compra finalizada. Total: $${total.toFixed(2)}`);
        
        cart = [];
        updateCart();
        saveCart();
        toggleCart();
    }

    // Event Listeners
    cartBtn.addEventListener('click', toggleCart);

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        if (name && email && message) {
            console.log('Formulario válido:', { name, email, message });
            contactForm.submit();
        } else {
            alert('Por favor, complete todos los campos');
        }
    });

    // Inicializar
    fetchProducts();
    updateCart();
});