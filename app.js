// ⚠️ REPLACE THIS WITH YOUR GOOGLE SCRIPT URL FROM STEP 1
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzdxg5lNxliyKgm6ottMrcm3u7TDin7Yfc31wv_IsP6Zu5v1aQNZ7vBE1bDDiLkHQvRvQ/exec';

const { useState } = React;
const { ShoppingCart, Plus, Minus, Trash2, Coffee, X, Check, CreditCard, Wallet, Banknote, ChefHat } = lucide;

const CafeOrderingSystem = () => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [currentStep, setCurrentStep] = useState('menu');
  const [orderType, setOrderType] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  const menuItems = [
    { id: 1, name: 'Espresso', price: 8.00, category: 'Coffee', image: '☕', description: 'Rich and bold' },
    { id: 2, name: 'Cappuccino', price: 12.00, category: 'Coffee', image: '☕', description: 'Smooth and creamy' },
    { id: 3, name: 'Latte', price: 12.00, category: 'Coffee', image: '☕', description: 'Mild and sweet' },
    { id: 4, name: 'Mocha', price: 14.00, category: 'Coffee', image: '☕', description: 'Chocolate delight' },
    { id: 5, name: 'Americano', price: 10.00, category: 'Coffee', image: '☕', description: 'Classic black' },
    { id: 6, name: 'Croissant', price: 8.00, category: 'Pastry', image: '🥐', description: 'Buttery and flaky' },
    { id: 7, name: 'Blueberry Muffin', price: 9.00, category: 'Pastry', image: '🧁', description: 'Fresh baked daily' },
    { id: 8, name: 'Chocolate Cake', price: 15.00, category: 'Dessert', image: '🍰', description: 'Decadent treat' },
    { id: 9, name: 'Cheesecake', price: 16.00, category: 'Dessert', image: '🍰', description: 'Creamy perfection' },
    { id: 10, name: 'Green Tea', price: 7.00, category: 'Tea', image: '🍵', description: 'Refreshing' }
  ];

  const malaysianBanks = [
    'Maybank', 'CIMB Bank', 'Public Bank', 'RHB Bank', 'Hong Leong Bank',
    'AmBank', 'Bank Islam', 'Bank Rakyat', 'OCBC Bank', 'UOB Bank'
  ];

  const ewallets = [
    'Touch \'n Go eWallet', 'Boost', 'GrabPay', 'ShopeePay', 'MAE by Maybank'
  ];

  const categories = [...new Set(menuItems.map(item => item.category))];

  const addToCart = (item) => {
    const existing = cart.find(cartItem => cartItem.id === item.id);
    if (existing) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
    ).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
  };

  const sendToGoogleSheets = async (orderData) => {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert('Please add items to your cart');
      return;
    }
    setCurrentStep('orderType');
  };

  const selectOrderType = (type) => {
    setOrderType(type);
    setCurrentStep('details');
  };

  const proceedToPayment = () => {
    if (!customerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Please enter your phone number');
      return;
    }
    if (orderType === 'dine-in' && !tableNumber.trim()) {
      alert('Please enter your table number');
      return;
    }
    setCurrentStep('payment');
  };

  const processPayment = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (paymentMethod === 'fpx' && !selectedBank) {
      alert('Please select your bank');
      return;
    }

    if (paymentMethod === 'ewallet' && !selectedBank) {
      alert('Please select your e-wallet');
      return;
    }

    const newOrderNumber = generateOrderNumber();
    setOrderNumber(newOrderNumber);

    const orderData = {
      orderNumber: newOrderNumber,
      timestamp: new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }),
      orderType: orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : 'N/A',
      customerName: customerName,
      customerPhone: customerPhone,
      items: cart.map(item => `${item.name} x${item.quantity}`).join(', '),
      total: getTotalPrice(),
      paymentMethod: paymentMethod,
      paymentDetails: paymentMethod === 'cash' ? 'Cash at Counter' : selectedBank,
      paymentStatus: paymentMethod === 'cash' ? 'Unpaid' : 'Paid',
      status: paymentMethod === 'cash' ? 'Pending Payment' : 'Preparing'
    };

    await sendToGoogleSheets(orderData);

    if (paymentMethod === 'fpx' || paymentMethod === 'ewallet') {
      setTimeout(() => {
        setOrderStatus('preparing');
        setCurrentStep('success');
      }, 2000);
    } else {
      setOrderStatus('pending');
      setCurrentStep('success');
    }
  };

  const startNewOrder = () => {
    setCart([]);
    setCurrentStep('menu');
    setOrderType('');
    setCustomerName('');
    setCustomerPhone('');
    setTableNumber('');
    setPaymentMethod('');
    setOrderNumber('');
    setOrderStatus('');
    setSelectedBank('');
    setShowCart(false);
  };

  // Copy all the render functions from the artifact (renderMenu, renderOrderType, etc.)
  // I'll include them in a follow-up message to keep this concise
  
  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-amber-50 to-orange-50' },
    // Header and content will go here
  );
};

ReactDOM.render(React.createElement(CafeOrderingSystem), document.getElementById('root'));
