import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from "../../assets/Inky Pinky-logo-b.png";

const BillingDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef();

  const formData = location.state?.formData || {
    kidName: '',
    kidDob: '',
    kidGender: '',
    parentName: '',
    parentPhone: '',
    package: '',
    timeSlot: '',
    estimatedEnd: ''
  };

  const [discountInput, setDiscountInput] = React.useState(0);
  const [socksInput, setSocksInput] = React.useState(1);
  const [socksSize, setSocksSize] = React.useState('small');
  const [appliedDiscount, setAppliedDiscount] = React.useState(5);
  const [appliedSocks, setAppliedSocks] = React.useState(1);
  const [appliedSocksSize, setAppliedSocksSize] = React.useState('small');
  const [showModal, setShowModal] = React.useState(false);
  const [packagePriceInput, setPackagePriceInput] = React.useState(
    formData.package === '2 Hours' ? 569 : 299
  );

  // Package prices
  const packagePrices = {
    '1 Hour': 299,
    '2 Hours': 569
  };

  // Socks prices
  const socksPrices = {
    small: 50,
    large: 60
  };

  const socksPrice = socksPrices[appliedSocksSize];
  const subtotal = packagePriceInput + (appliedSocks * socksPrice);
  const discountAmount = (subtotal * discountInput) / 100;
  const total = subtotal - discountAmount;

  const handleEdit = () => {
    navigate('/new-entry', { state: { formData } });
  };

  const handleApplyDiscount = (e) => {
    e.preventDefault();
    setAppliedDiscount(discountInput);
  };

  const handleApplySocks = (e) => {
    e.preventDefault();
    setAppliedSocks(socksInput);
    setAppliedSocksSize(socksSize);
  };

  const handlePackageChange = (e) => {
    const selectedPackage = e.target.value;
    setPackagePriceInput(packagePrices[selectedPackage]);
  };

  const convertTo24HourFormat = (timeString) => {
    if (!timeString) return '';
    
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      return timeString;
    }
    
    const time = timeString.match(/(\d+):(\d+)\s?(AM|PM)?/i);
    if (!time) return '';
    
    let hours = parseInt(time[1], 10);
    const minutes = time[2];
    const period = time[3] ? time[3].toUpperCase() : '';
    
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleContinue = async () => {
    const registrationData = {
      kidname: formData.kidName,
      dob: formData.kidDob,
      gender: formData.kidGender,
      parentname: formData.parentName,
      mobile: formData.parentPhone,
      packagename: formData.package,
      entrydate: formData.entryDate,
      entrytime: convertTo24HourFormat(formData.timeSlot),
      exittime: convertTo24HourFormat(formData.estimatedEnd),
      discount: discountAmount.toFixed(2),
      sockspair: appliedSocks.toString(),
      sockssize: appliedSocksSize,
      socksprice: (appliedSocks * socksPrice).toString(),
      packagecost: packagePriceInput.toString(),
      totalamount: total.toFixed(2)
    };

    try {
      const response = await axios.post('http://192.168.1.9:8080/newRegister', registrationData);
      if (response.status === 200) {
        setShowModal(true);
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('An error occurred. Please check your connection and try again.');
    }
  };

  const handlePrint = () => {
    setShowModal(false);
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              @page { size: 80mm auto; margin: 0; }
              body { 
                font-family: Arial, sans-serif; 
                width: 80mm; 
                padding: 2mm; 
                font-size: 12px;
                line-height: 1.2;
              }
              .logo { 
                width: 40mm; 
                height: auto;
                display: block;
                margin: 0 auto;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .text-bold { font-weight: bold; }
              .divider { 
                border-top: 1px dashed #000; 
                margin: 3mm 0;
              }
              .item-row { 
                display: flex; 
                justify-content: space-between;
                margin: 2mm 0;
              }
              .total-row { 
                margin-top: 3mm;
                font-size: 14px;
              }
              .store-info {
                margin-bottom: 3mm;
              }
              .customer-info {
                margin-bottom: 3mm;
              }
              .items {
                margin-bottom: 3mm;
              }
            </style>
          </head>
          <body>
            <div class="store-info text-center">
              <img src="${logo}" alt="Logo" class="logo" />
              <h2 style="margin: 2mm 0; font-size: 16px;">Soft Play Zone</h2>
              <p style="margin: 1mm 0;">No.10/10B, Sheshadri palayam pazhani street,
  Little Kanchipuram 
  </p>
              <p style="margin: 1mm 0;">Phone: +917871737333
  </p>
              <div class="divider"></div>
            </div>

            <div class="customer-info">
              <p style="margin: 1mm 0;"><span class="text-bold">Kid:</span> ${formData.kidName}</p>
              <p style="margin: 1mm 0;"><span class="text-bold">Parent:</span> ${formData.parentName}</p>
              <p style="margin: 1mm 0;"><span class="text-bold">Phone:</span> ${formData.parentPhone}</p>
              <p style="margin: 1mm 0;"><span class="text-bold">Date:</span> ${formData.entryDate}</p>
              <p style="margin: 1mm 0;"><span class="text-bold">Start Time:</span> ${formData.timeSlot}</p>
              <p style="margin: 1mm 0;"><span class="text-bold">End Time:</span>${formData.estimatedEnd}</p>
              <div class="divider"></div>
            </div>

            <div class="items">
              <div class="item-row">
                <span>${formData.package}</span>
                <span>₹${packagePriceInput}</span>
              </div>
              <div class="item-row">
                <span>Socks (${appliedSocks} ${appliedSocksSize} pair${appliedSocks !== 1 ? 's' : ''})</span>
                <span>₹${(appliedSocks * socksPrice).toFixed(2)}</span>
              </div>
              <div class="divider"></div>
              <div class="item-row">
                <span>Subtotal</span>
                <span>₹${subtotal.toFixed(2)}</span>
              </div>
              <div class="item-row">
                <span>Discount (${appliedDiscount}%)</span>
                <span>-₹${discountAmount.toFixed(2)}</span>
              </div>
              <div class="divider"></div>
              <div class="item-row text-bold total-row">
                <span>TOTAL</span>
                <span>₹${total.toFixed(2)}</span>
              </div>
              <div class="divider"></div>
            </div>

            <div class="text-center" style="margin-top: 5mm;">
              <p style="margin: 2mm 0;">Thank you for visiting!</p>
              <p style="margin: 2mm 0;">Please come again</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 200);
    }, 100);
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 bg-white rounded-xl shadow-md p-8 print:hidden">
      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-center">Success!</h3>
            <p className="text-center mb-6 text-gray-700">Registration completed successfully.</p>
            <button
              onClick={handlePrint}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Print Receipt
            </button>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Review</h3>
            <button onClick={handleEdit} className="text-blue-600 text-sm hover:underline">Edit</button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 text-sm space-y-1">
            <h4 className="font-semibold mb-2 text-xl">Customer Details</h4>
            <div className="space-y-2">
              <div className="flex text-[16px]">
                <span className="text-gray-500 w-40">Kid Name:</span>
                <span className="text-black font-medium">{formData.kidName}</span>
              </div>
              <div className="flex text-[16px]">
                <span className="text-gray-500 w-40">Date of Birth:</span>
                <span className="text-black font-medium">{formData.kidDob}</span>
              </div>
              <div className="flex text-[16px]">
                <span className="text-gray-500 w-40">Gender:</span>
                <span className="text-black font-medium">{formData.kidGender}</span>
              </div>
              <div className="flex text-[16px]">
                <span className="text-gray-500 w-40">Parent Name:</span>
                <span className="text-black font-medium">{formData.parentName}</span>
              </div>
              <div className="flex text-[16px]">
                <span className="text-gray-500 w-40">Phone Number:</span>
                <span className="text-black font-medium">{formData.parentPhone}</span>
              </div>
            </div>

            <div className="pt-6 mt-4">
              <h4 className="font-semibold mb-2 text-xl">Package Details</h4>
              <div className="space-y-2">
                <div className="flex text-[16px]">
                  <span className="text-gray-500 w-40">Package:</span>
                  <span className="text-black font-medium">{formData.package}</span>
                </div>
                <div className="flex text-[16px]">
                  <span className="text-gray-500 w-40">Package Price:</span>
                  <input
                    type="number"
                    value={packagePriceInput}
                    onChange={(e) => setPackagePriceInput(Number(e.target.value))}
                    className="border rounded px-2 py-1 w-20"
                  />
                </div>
                <div className="flex text-[16px]">
                  <span className="text-gray-500 w-40">Entry Time:</span>
                  <span className="text-black font-medium">{formData.timeSlot}</span>
                </div>
                <div className="flex text-[16px]">
                  <span className="text-gray-500 w-40">Estimated End:</span>
                  <span className="text-black font-medium">{formData.estimatedEnd}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="space-y-6">
          <div>
            <label htmlFor="discount" className="block text-sm font-medium mb-1">Discount (%)</label>
            <form onSubmit={handleApplyDiscount} className="flex space-x-2">
              <select
                id="discount"
                value={discountInput}
                onChange={(e) => setDiscountInput(Number(e.target.value))}
                className="flex-1 border rounded-md px-4 py-2"
              >
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={10}>10%</option>
              </select>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Apply</button>
            </form>
          </div>

          <div>
            <label htmlFor="socks" className="block text-sm font-medium mb-1">Socks</label>
            <form onSubmit={handleApplySocks} className="space-y-2">
              <div className="flex space-x-2">
                <input
                  id="socks"
                  type="number"
                  value={socksInput}
                  onChange={(e) => setSocksInput(Number(e.target.value))}
                  className="flex-1 border rounded-md px-4 py-2"
                  min="0"
                />
                <select
                  value={socksSize}
                  onChange={(e) => setSocksSize(e.target.value)}
                  className="flex-1 border rounded-md px-4 py-2"
                >
                  <option value="small">Small (₹50)</option>
                  <option value="large">Large (₹60)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded-md">Apply</button>
            </form>
          </div>

          <div className="border p-4 rounded-md text-sm space-y-2">
            <h4 className="font-semibold">Price Summary</h4>
            <div className="flex justify-between"><span>Package</span><span>₹{packagePriceInput}</span></div>
            <div className="flex justify-between">
              <span>Socks ({appliedSocks} {appliedSocksSize})</span>
              <span>₹{appliedSocks * socksPrice}</span>
            </div>
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between"><span>Discount ({discountInput}%)</span><span>-₹{discountAmount.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
          </div>

          <button onClick={handleContinue} className="w-full bg-blue-500 text-white py-3 rounded-md mt-2">Continue</button>
        </div>
      </div>
    </div>
  );
};

export default BillingDetails;