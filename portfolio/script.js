const products = [
    { name: "Titus Fish", price: 7000, image: "images/titus-fish.jpg", unit: "kg" },
    { name: "Hake Fish", price: 4000, image: "images/hake-fish.jpg", unit: "kg" },
    { name: "Croaker Fish", price: 5500, image: "images/croaker-fish.jpg", unit: "kg" },
    { name: "Shawa Fish", price: 3200, image: "images/Shawa.jpg", unit: "kg" },
    { name: "Kote Fish", price: 3500, image: "images/Kote.jpg", unit: "kg" },
    { name: "Owere Fish", price: 4800, image: "images/Owere-fish.jpg", unit: "kg" },
    { name: "Tilapia Fish", price: 5000, image: "images/Tilapia.jpg", unit: "kg" },
    { name: "Chicken Lap", price: 6500, image: "images/chicken-lap.jpg", unit: "kg" },
    { name: "Orobo Chicken", price: 6500, image: "images/Orobo-chicken.jpg", unit: "kg" },
    { name: "Chicken wings", price: 7500, image: "images/chicken-wings.jpg", unit: "kg" },
    { name: "Full chicken", price: 2500, image: "images/Full-chicken.jpg", unit: "kg" },
    { name: "Sausage", price: 2200, image: "images/Sausage.jpg", unit: "pc" },
    { name: "Turkey Finger", price: 6000, image: "images/turkey-finger.jpg", unit: "kg" },
    { name: "Turkey Gizzard", price: 7000, image: "images/Turkey-Gizzard.jpg", unit: "kg" },
    { name: "Turkey", price: 9500, image: "images/turkey.jpg", unit: "kg" },
    { name: "Goat Meat", price: 8000, image: "images/goat-meat.jpg", unit: "kg" },
];

let cart = []; // Global cart array

// IMPORTANT: REPLACE '2348012345678' with your actual WhatsApp number.
// It should include the country code but no '+' or leading zeros.
// Example for Nigeria: '2348012345678'
const WHATSAPP_NUMBER = '2348023052016'; // <<< YOU MUST CHANGE THIS!

const productList = document.getElementById("product-list");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const cartCountSpan = document.getElementById("cartCount");
const cartLink = document.getElementById("cartLink");
const cartSummarySection = document.getElementById("cart-summary");
const cartItemsDisplay = document.getElementById("cart-items-display");
const cartTotalPriceSpan = document.getElementById("cartTotalPrice");
const placeOrderBtn = document.getElementById("placeOrderBtn");

// Function to render products (for initial load and search)
function renderProducts(productsToDisplay) {
    productList.innerHTML = ''; // Clear existing products
    if (productsToDisplay.length === 0) {
        productList.innerHTML = '<p style="text-align: center; color: #555;">No products found matching your search.</p>';
        return;
    }

    productsToDisplay.forEach(product => {
        const productDiv = document.createElement("div");
        productDiv.setAttribute('data-name', product.name);
        productDiv.setAttribute('data-price', product.price);
        productDiv.setAttribute('data-unit', product.unit);

        let quantityOptionsHTML = '';
        let priceDisplayUnit = '';

        if (product.unit === "pc") {
            quantityOptionsHTML = `
                <option value="1" selected>1 pc</option>
                <option value="2">2 pcs</option>
                <option value="3">3 pcs</option>
                <option value="5">5 pcs</option>
                <option value="10">10 pcs</option>
            `;
            priceDisplayUnit = 'pc';
        } else {
            quantityOptionsHTML = `
                <option value="0.5">0.5 kg</option>
                <option value="1" selected>1 kg</option>
                <option value="2">2 kg</option>
                <option value="5">5 kg</option>
            `;
            priceDisplayUnit = 'kg';
        }

        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h3>${product.name}</h3>
            <p>Price per ${priceDisplayUnit}: ₦${product.price.toLocaleString()}</p>
            <div class="quantity-selector">
                <label for="quantity-${product.name.replace(/\s+/g, '-')}" class="quantity-label">Select Quantity:</label>
                <select id="quantity-${product.name.replace(/\s+/g, '-')}" class="product-quantity">
                    ${quantityOptionsHTML}
                </select>
            </div>
            <button onclick="addToCart(this)">Add to Cart</button>
        `;
        productList.appendChild(productDiv);
    });
}

// Function to update the cart count display and show/hide summary
function updateCartCountDisplay() {
    cartCountSpan.textContent = cart.length;
    if (cart.length > 0) {
        cartSummarySection.style.display = 'block'; // Show the section
    } else {
        cartSummarySection.style.display = 'none'; // Hide the section
    }
}

// Function to display items in the cart summary section
function renderCartSummary() {
    cartItemsDisplay.innerHTML = ''; // Clear existing items
    let overallTotalPrice = 0;

    if (cart.length === 0) {
        cartItemsDisplay.innerHTML = '<p>Your cart is empty. Add some delicious items!</p>';
    } else {
        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            // Added a span to group text info and a remove button
            itemDiv.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name-qty">${item.name} (${item.quantity} ${item.unit})</span>
                    <span class="cart-item-price">₦${item.totalPrice.toLocaleString()}</span>
                </div>
                <button class="remove-item-btn" data-product-name="${item.name}" aria-label="Remove ${item.name}">Remove</button>
            `;
            cartItemsDisplay.appendChild(itemDiv);
            overallTotalPrice += item.totalPrice;
        });
    }
    cartTotalPriceSpan.textContent = overallTotalPrice.toLocaleString();

    // Attach event listeners to the new "Remove" buttons
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productName = event.target.dataset.productName;
            removeFromCart(productName);
        });
    });
}

// Add to Cart function (modified)
function addToCart(buttonElement) {
    const productDiv = buttonElement.closest('div[data-name]');
    const productName = productDiv.getAttribute('data-name');
    const basePrice = parseFloat(productDiv.getAttribute('data-price'));
    const unit = productDiv.getAttribute('data-unit');

    const quantitySelect = productDiv.querySelector('.product-quantity');
    const selectedQuantity = parseFloat(quantitySelect.value);

    const totalPrice = basePrice * selectedQuantity;

    const existingItemIndex = cart.findIndex(item => item.name === productName);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += selectedQuantity;
        cart[existingItemIndex].totalPrice += totalPrice;
    } else {
        cart.push({
            name: productName,
            quantity: selectedQuantity,
            unit: unit,
            pricePerUnit: basePrice, // Store original price per unit for quantity adjustment
            totalPrice: totalPrice
        });
    }

    updateCartCountDisplay();
    renderCartSummary(); // Always re-render summary after adding an item
    console.log("Current Cart:", cart);
}

// NEW: Function to remove items from the cart
function removeFromCart(productName) {
    const itemIndex = cart.findIndex(item => item.name === productName);

    if (itemIndex > -1) {
        const item = cart[itemIndex];

        // Decrease quantity by one unit
        if (item.quantity > 1) {
            item.quantity -= 1;
            item.totalPrice -= item.pricePerUnit; // Subtract the price of one unit
            console.log(`Decreased quantity of ${productName}. New quantity: ${item.quantity}`);
        } else {
            // If quantity is 1, remove the item entirely
            cart.splice(itemIndex, 1);
            console.log(`Removed ${productName} from cart.`);
        }
    }

    updateCartCountDisplay(); // Update the count badge
    renderCartSummary();     // Re-render the cart summary
}

// Search functionality
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
}

// Function to send order via WhatsApp
function sendOrderViaWhatsApp() {
    if (cart.length === 0) {
        alert("Your cart is empty! Please add some items before placing an order.");
        return;
    }

    if (WHATSAPP_NUMBER === '+2348023052016') {
        alert("Please set your WhatsApp number in script.js before placing an order!");
        console.error("WhatsApp number not configured! Please edit script.js and set WHATSAPP_NUMBER.");
        return;
    }

    let orderMessage = "Hello, I'd like to place an order for the following items from your Frozen Seafood Store:\n\n";
    let totalOrderPrice = 0;

    cart.forEach((item, index) => {
        orderMessage += `${index + 1}. ${item.name} - Quantity: ${item.quantity} ${item.unit} - Price: ₦${item.totalPrice.toLocaleString()}\n`;
        totalOrderPrice += item.totalPrice;
    });

    orderMessage += `\nTotal Order Price: ₦${totalOrderPrice.toLocaleString()}\n`;
    orderMessage += "\nPlease let me know the next steps for payment and delivery. Thank you!";

    const encodedMessage = encodeURIComponent(orderMessage);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    // Optional: Clear cart after order is "sent" to WhatsApp.
    // Uncomment the lines below if you want the cart to reset immediately.
    // cart = [];
    // updateCartCountDisplay();
    // renderCartSummary();
    // alert("Your order has been sent to WhatsApp! Please confirm the message there.");
}


// Event Listeners
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('input', performSearch); // Live search as user types

// Event listener for the "Place Order via WhatsApp" button
placeOrderBtn.addEventListener('click', sendOrderViaWhatsApp);

// Event listener for the cart link in the header to scroll to summary
cartLink.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default link behavior
    cartSummarySection.scrollIntoView({ behavior: 'smooth' });
    renderCartSummary(); // Ensure summary is updated when scrolled to
});

// Initial load: Render all products and update cart count
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    updateCartCountDisplay();
    renderCartSummary(); // Render empty cart summary on load
});