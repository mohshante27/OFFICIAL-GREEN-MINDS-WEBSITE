
// M-Pesa Daraja API Integration Backend
// This is a template for Node.js/Express backend implementation

const axios = require('axios');
const crypto = require('crypto');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackURL = process.env.MPESA_CALLBACK_URL;
    this.baseURL = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';
  }

  // Generate access token
  async generateAccessToken() {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(`${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });

      return response.data.access_token;
    } catch (error) {
      console.error('Error generating access token:', error);
      throw new Error('Failed to generate M-Pesa access token');
    }
  }

  // Generate security credentials (password)
  generatePassword(timestamp) {
    const data = `${this.businessShortCode}${this.passkey}${timestamp}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Initiate STK Push (Lipisha Na M-Pesa)
  async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      const accessToken = await this.generateAccessToken();
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -4);
      const password = this.generatePassword(timestamp);

      // Format phone number (add country code)
      const formattedPhone = phoneNumber.startsWith('0') ? `254${phoneNumber.slice(1)}` : phoneNumber;

      const requestData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: this.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackURL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        checkoutRequestID: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage
      };

    } catch (error) {
      console.error('Error initiating STK Push:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errorMessage || 'Failed to initiate M-Pesa payment'
      };
    }
  }

  // Check transaction status
  async checkTransactionStatus(checkoutRequestID) {
    try {
      const accessToken = await this.generateAccessToken();
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -4);
      const password = this.generatePassword(timestamp);

      const requestData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpushquery/v1/query`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc,
        transactionData: response.data
      };

    } catch (error) {
      console.error('Error checking transaction status:', error);
      return {
        success: false,
        error: 'Failed to check transaction status'
      };
    }
  }

  // Handle M-Pesa callback (webhook)
  handleCallback(callbackData) {
    try {
      const result = callbackData.Body.stkCallback;
      
      // Check if payment was successful
      if (result.ResultCode === 0) {
        // Payment successful
        const metadata = result.CallbackMetadata.Item;
        
        const transactionData = {
          amount: metadata.find(item => item.Name === 'Amount')?.Value,
          mpesaReceiptNumber: metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value,
          transactionDate: metadata.find(item => item.Name === 'TransactionDate')?.Value,
          phoneNumber: metadata.find(item => item.Name === 'PhoneNumber')?.Value
        };

        // Save transaction to database
        this.saveSuccessfulTransaction(transactionData);

        return {
          success: true,
          transaction: transactionData
        };
      } else {
        // Payment failed
        return {
          success: false,
          error: result.ResultDesc
        };
      }
    } catch (error) {
      console.error('Error handling callback:', error);
      return {
        success: false,
        error: 'Failed to process callback'
      };
    }
  }

  // Save successful transaction to database
  async saveSuccessfulTransaction(transactionData) {
    // Implement database save logic here
    // Example using MongoDB:
    /*
    const donation = new Donation({
      amount: transactionData.amount,
      mpesaReceiptNumber: transactionData.mpesaReceiptNumber,
      phoneNumber: transactionData.phoneNumber,
      transactionDate: new Date(transactionData.transactionDate),
      status: 'completed',
      paymentMethod: 'mpesa'
    });

    await donation.save();
    */

    console.log('Transaction saved:', transactionData);
  }
}

module.exports = MpesaService;

// Example Express route implementation:
/*
const express = require('express');
const MpesaService = require('./mpesa-service');
const router = express.Router();

const mpesaService = new MpesaService();

// Initiate payment endpoint
router.post('/initiate-payment', async (req, res) => {
  try {
    const { phoneNumber, amount, accountReference, transactionDesc } = req.body;

    // Validate input
    if (!phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and amount are required'
      });
    }

    const result = await mpesaService.initiateSTKPush(
      phoneNumber,
      amount,
      accountReference || 'GREENMINDS',
      transactionDesc || 'Donation to Green Minds Youth Initiative'
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Payment initiated successfully',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// M-Pesa callback endpoint (webhook)
router.post('/mpesa-callback', (req, res) => {
  try {
    const result = mpesaService.handleCallback(req.body);

    if (result.success) {
      // Send success response to M-Pesa
      res.json({
        ResultCode: 0,
        ResultDesc: 'Success'
      });
    } else {
      // Send failure response to M-Pesa
      res.json({
        ResultCode: 1,
        ResultDesc: result.error
      });
    }
  } catch (error) {
    console.error('Callback error:', error);
    res.json({
      ResultCode: 1,
      ResultDesc: 'Failed to process callback'
    });
  }
});

// Check payment status endpoint
router.post('/check-payment-status', async (req, res) => {
  try {
    const { checkoutRequestID } = req.body;

    if (!checkoutRequestID) {
      return res.status(400).json({
        success: false,
        error: 'Checkout request ID is required'
      });
    }

    const result = await mpesaService.checkTransactionStatus(checkoutRequestID);

    if (result.success) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
*/