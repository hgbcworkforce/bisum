import { supabase, TABLES, handleSupabaseError, PAYMENT_STATUS } from './supabase.js'
import { updateAttendeePaymentStatus } from './attendees.js'

// Create a new payment record
export const createPayment = async (paymentData) => {
  try {
    const newPayment = {
      transaction_ref: paymentData.transactionRef,
      flutterwave_transaction_id: paymentData.flutterwaveTransactionId,
      attendee_id: paymentData.attendeeId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'NGN',
      status: PAYMENT_STATUS.PENDING,
      payment_method: paymentData.paymentMethod,
      payment_channel: paymentData.paymentChannel,
      flutterwave_response: {
        ...paymentData.flutterwaveResponse,
        ...paymentData.metadata
      } || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from(TABLES.PAYMENTS)
      .insert(newPayment)
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data,
      message: 'Payment record created successfully'
    }
  } catch (error) {
    console.error('Error creating payment:', error)
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Failed to create payment record'
    }
  }
}

// Get payment by ID
export const getPaymentById = async (id) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PAYMENTS)
      .select(`
        *,
        attendees (
          id,
          first_name,
          last_name,
          email,
          registration_number
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Error fetching payment:', error)
    return {
      success: false,
      error: handleSupabaseError(error)
    }
  }
}

// Get payment by transaction reference
export const getPaymentByTransactionRef = async (transactionRef) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PAYMENTS)
      .select(`
        *,
        attendees (
          id,
          first_name,
          last_name,
          email,
          registration_number
        )
      `)
      .eq('transaction_ref', transactionRef)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Error fetching payment by transaction ref:', error)
    return {
      success: false,
      error: handleSupabaseError(error)
    }
  }
}

// Get payment by Flutterwave transaction ID
export const getPaymentByFlutterwaveId = async (flutterwaveTransactionId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PAYMENTS)
      .select(`
        *,
        attendees (
          id,
          first_name,
          last_name,
          email,
          registration_number
        )
      `)
      .eq('flutterwave_transaction_id', flutterwaveTransactionId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Error fetching payment by Flutterwave ID:', error)
    return {
      success: false,
      error: handleSupabaseError(error)
    }
  }
}

// Get payments by attendee ID
export const getPaymentsByAttendeeId = async (attendeeId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PAYMENTS)
      .select('*')
      .eq('attendee_id', attendeeId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Error fetching payments by attendee:', error)
    return {
      success: false,
      error: handleSupabaseError(error)
    }
  }
}

// Get all payments with pagination and filtering
export const getPayments = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = null,
      dateFrom = null,
      dateTo = null,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options

    let query = supabase
      .from(TABLES.PAYMENTS)
      .select(`
        *,
        attendees (
          id,
          first_name,
          last_name,
          email,
          registration_number
        )
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(
        `transaction_ref.ilike.%${search}%,flutterwave_transaction_id.ilike.%${search}%,attendees.first_name.ilike.%${search}%,attendees.last_name.ilike.%${search}%,attendees.email.ilike.%${search}%,attendees.registration_number.ilike.%${search}%`
      )
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (dateFrom) {
      query = query.gte('paid_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('paid_at', dateTo)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data,
      pagination: {
        total: count,
        page: page,
        limit: limit,
        pages: Math.ceil(count / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching payments:', error)
    return {
      success: false,
      error: handleSupabaseError(error)
    }
  }
}

// Update payment status
export const updatePayment = async (id, updateData) => {
  try {
    const updates = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from(TABLES.PAYMENTS)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data,
      message: 'Payment updated successfully'
    }
  } catch (error) {
    console.error('Error updating payment:', error)
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Failed to update payment'
    }
  }
}

// Mark payment as successful
export const markPaymentAsSuccessful = async (paymentId, flutterwaveData = {}) => {
  try {
    // Start a transaction to update both payment and attendee
    const { data: payment, error: paymentError } = await supabase
      .from(TABLES.PAYMENTS)
      .update({
        status: PAYMENT_STATUS.COMPLETED,
        paid_at: new Date().toISOString(),
        flutterwave_response: flutterwaveData,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select('attendee_id')
      .single()

    if (paymentError) {
      throw paymentError
    }

    // Update attendee payment status
    const attendeeResult = await updateAttendeePaymentStatus(payment.attendee_id, 'completed')

    if (!attendeeResult.success) {
      throw new Error('Failed to update attendee payment status')
    }

    return {
      success: true,
      message: 'Payment marked as successful'
    }
  } catch (error) {
    console.error('Error marking payment as successful:', error)
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Failed to mark payment as successful'
    }
  }
}

// Mark payment as failed
export const markPaymentAsFailed = async (paymentId, errorMessage = '', errorCode = '') => {
  try {
    // Start a transaction to update both payment and attendee
    const { data: payment, error: paymentError } = await supabase
      .from(TABLES.PAYMENTS)
      .update({
        status: PAYMENT_STATUS.FAILED,
        error_message: errorMessage,
        error_code: errorCode,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select('attendee_id')
      .single()

    if (paymentError) {
      throw paymentError
    }

    // Update attendee payment status
    const attendeeResult = await updateAttendeePaymentStatus(payment.attendee_id, 'failed')

    if (!attendeeResult.success) {
      throw new Error('Failed to update attendee payment status')
    }

    return {
      success: true,
      message: 'Payment marked as failed'
    }
  } catch (error) {
    console.error('Error marking payment as failed:', error)
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Failed to mark payment as failed'
    }
  }
}

// Get payment statistics
export const getPaymentStats = async (dateRange = null) => {
  try {
    // Using a view is more efficient, but since we can't create one,
    // let's ensure the query is as efficient as possible.
    // If a payment_stats view existed, the query would be:
    // let { data, error } = await supabase.from('payment_stats').select('*').single();

    let query = supabase
      .from(TABLES.PAYMENTS)
      .select('amount, status', { count: 'exact' });

    if (dateRange && dateRange.from && dateRange.to) {
      query = query.gte('created_at', dateRange.from).lte('created_at', dateRange.to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const successfulPayments = data.filter(p => p.status === 'completed');
    const successfulAmount = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPayments = count;

    const stats = {
      totalPayments: totalPayments,
      totalAmount: data.reduce((sum, p) => sum + p.amount, 0),
      successfulPayments: successfulPayments.length,
      successfulAmount: successfulAmount,
      pendingPayments: data.filter(p => p.status === 'pending').length,
      failedPayments: data.filter(p => p.status === 'failed').length,
      cancelledPayments: data.filter(p => p.status === 'cancelled').length,
      averageAmount: successfulPayments.length > 0 ? successfulAmount / successfulPayments.length : 0,
      successRate: totalPayments > 0 ? ((successfulPayments.length / totalPayments) * 100).toFixed(2) : 0,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return {
      success: false,
      error: handleSupabaseError(error),
    };
  }
};

// Get payments by date range
export const getPaymentsByDateRange = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PAYMENTS)
      .select(`
        *,
        attendees (
          id,
          first_name,
          last_name,
          email,
          registration_number
        )
      `)
      .gte('paid_at', startDate)
      .lte('paid_at', endDate)
      .order('paid_at', { ascending: false })

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Error fetching payments by date range:', error)
    return {
      success: false,
      error: handleSupabaseError(error)
    }
  }
}

// Process Flutterwave webhook
export const processFlutterwaveWebhook = async (webhookData) => {
  try {
    const { event, data: eventData } = webhookData

    if (!eventData || !eventData.tx_ref) {
      throw new Error('Invalid webhook data')
    }

    // Get the payment record
    const paymentResult = await getPaymentByTransactionRef(eventData.tx_ref)

    if (!paymentResult.success || !paymentResult.data) {
      throw new Error('Payment record not found')
    }

    const payment = paymentResult.data

    switch (event) {
      case 'charge.completed':
        if (eventData.status === 'successful') {
          return await markPaymentAsSuccessful(payment.id, eventData)
        } else {
          return await markPaymentAsFailed(payment.id, eventData.processor_response, eventData.status)
        }

      case 'charge.failed':
        return await markPaymentAsFailed(payment.id, eventData.processor_response, eventData.status)

      default:
        // Update payment with webhook data for other events
        return await updatePayment(payment.id, {
          flutterwave_response: {
            ...payment.flutterwave_response,
            ...eventData,
            last_webhook_event: event,
            last_webhook_time: new Date().toISOString()
          }
        })
    }
  } catch (error) {
    console.error('Error processing Flutterwave webhook:', error)
    return {
      success: false,
      error: error.message || 'Failed to process webhook',
      message: 'Webhook processing failed'
    }
  }
}

// Verify payment with Flutterwave
export const verifyPaymentWithFlutterwave = async (transactionId) => {
  try {
    // This would typically call the Flutterwave API to verify the transaction
    // For now, we'll just fetch the payment from our database
    const paymentResult = await getPaymentByFlutterwaveId(transactionId)

    return paymentResult
  } catch (error) {
    console.error('Error verifying payment with Flutterwave:', error)
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Failed to verify payment'
    }
  }
}

// Real-time subscription for payment updates
export const subscribeToPayments = (callback) => {
  const subscription = supabase
    .channel('payments-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.PAYMENTS
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return subscription
}

// Export payments to CSV format data
export const exportPaymentsToCSV = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PAYMENTS)
      .select(`
        transaction_ref,
        flutterwave_transaction_id,
        amount,
        currency,
        status,
        payment_method,
        payment_channel,
        created_at,
        paid_at,
        attendees (
          registration_number,
          first_name,
          last_name,
          email
        )
      `)
      .order('paid_at', { ascending: false })

    if (error) {
      throw error
    }

    // Flatten the data for CSV export
    const flattenedData = data.map(payment => ({
      transaction_ref: payment.transaction_ref,
      flutterwave_transaction_id: payment.flutterwave_transaction_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      payment_method: payment.payment_method,
      payment_channel: payment.payment_channel,
      created_at: payment.created_at,
      paid_at: payment.paid_at,
      attendee_registration_number: payment.attendees?.registration_number,
      attendee_name: `${payment.attendees?.first_name} ${payment.attendees?.last_name}`,
      attendee_email: payment.attendees?.email
    }))

    return {
      success: true,
      data: flattenedData
    }
  } catch (error) {
    console.error('Error exporting payments:', error)
    return {
      success: false,
      error: handleSupabaseError(error)
    }
  }
}

// Generate payment summary report
export const generatePaymentSummaryReport = async (dateRange = null) => {
  try {
    const statsResult = await getPaymentStats(dateRange)
    const paymentsResult = await getPayments({
      limit: 1000,
      status: PAYMENT_STATUS.COMPLETED
    })

    if (!statsResult.success || !paymentsResult.success) {
      throw new Error('Failed to fetch data for report')
    }

    const report = {
      summary: statsResult.data,
      recentPayments: paymentsResult.data,
      generatedAt: new Date().toISOString(),
      dateRange: dateRange
    }

    return {
      success: true,
      data: report
    }
  } catch (error) {
    console.error('Error generating payment summary report:', error)
    return {
      success: false,
      error: handleSupabaseError(error)
    }
  }
}
