import { ipAddess } from '@/app/constans/ip';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Product {
  _id: string;
  price: number;
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  _id: string;
  full_name: string;
  address: string;
  orderCode: string;
  phone: string;
  paymentMethod: string;
  fee: number;
  products: Product[];
  total_price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  dateOrder: string;
  user: string;
}

interface OrderDetailProps {
  type: 'new' | 'my' | 'completed' | 'cancel';
}

const OrderDetail: React.FC<OrderDetailProps> = ({ type }) => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Format số tiền thành định dạng VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    })
      .format(amount)
      .replace('₫', 'VNĐ');
  };

  // Fetch chi tiết đơn hàng từ API
  useEffect(() => {
    console.log('Fetching order with id:', id);

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${ipAddess}/api/orders/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data: Order = await response.json();
        console.log('Order detail response:', data);
        if (response.ok) {
          // Kiểm tra tính hợp lệ của products
          if (data.products && Array.isArray(data.products)) {
            const hasInvalidProducts = data.products.some(
              (product) => !product._id || typeof product._id !== 'string'
            );
            if (hasInvalidProducts) {
              console.warn('Some products have invalid or missing _id:', data.products);
            }
          } else {
            console.warn('Products array is missing or invalid:', data.products);
            data.products = [];
          }
          setOrder(data);
        } else {
          console.error('Error fetching order:', data);
          Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
        }
      } catch (error) {
        console.error('Network error:', error);
        Alert.alert('Lỗi', 'Không thể kết nối tới server');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    } else {
      console.error('Order ID is missing');
      setLoading(false);
      Alert.alert('Lỗi', 'Không tìm thấy ID đơn hàng');
    }
  }, [id]);

  const handleAcceptOrder = async () => {
    try {
      setLoading(true);
      console.log('Accepting order with id:', id);

      const response = await fetch(`${ipAddess}/api/shipper_accept/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: id, status: 'processing' }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrder({ ...order!, status: 'processing' });
        Alert.alert('Thành công', 'Bạn đã nhận đơn hàng!');
      } else {
        const message = data?.message ?? 'Không thể nhận đơn hàng';
        Alert.alert('Lỗi', message);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      Alert.alert('Lỗi', 'Không thể kết nối tới server');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${ipAddess}/api/shipper/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, status: 'delivered' }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Thành công', 'Đơn hàng đã hoàn thành!');
        router.push('/page/Home');
      } else {
        Alert.alert('Lỗi', data.message || 'Không thể hoàn thành đơn hàng');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      Alert.alert('Lỗi', 'Không thể kết nối tới server');
    } finally {
      setLoading(false);
    }
  };

  const handleFailedDelivery = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${ipAddess}/api/orders/${id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, status: 'cancelled' }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Thành công', 'Đơn hàng đã được đánh dấu không thành công!');
        router.push('/page/Home');
      } else {
        Alert.alert('Lỗi', data.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error marking failed delivery:', error);
      Alert.alert('Lỗi', 'Không thể kết nối tới server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không tìm thấy đơn hàng!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <TouchableOpacity
          style={styles.userButton}
          onPress={() => router.push('/page/account/profile')}
        >
          <Image
            source={{ uri: 'https://img.icons8.com/ios-filled/50/user.png' }}
            style={styles.userIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Order Details */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderCode}>Mã đơn: {order.orderCode}</Text>
          <Text style={styles.dateOrder}>Ngày đặt: {formatDate(order.dateOrder)}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Trạng thái:{' '}
            {order.status === 'pending'
              ? 'Chờ lấy hàng'
              : order.status === 'processing'
              ? 'Chờ giao hàng'
              : order.status === 'delivered'
              ? 'Đã giao'
              : 'Đã hủy'}
          </Text>
        </View>

        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.full_name}</Text>
          <Text style={styles.customerAddress}>{order.address}</Text>
          <Text  style={styles.customerPhone}>SĐT: {order.phone}</Text>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>Danh sách sản phẩm:</Text>
          {order.products.length > 0 ? (
            order.products.map((product, index) => (
              <Text
                key={product._id || `product-${index}`} // Sử dụng index làm fallback nếu _id không hợp lệ
                style={styles.productItem}
              >
                {index + 1}. {product.product.name} x{product.quantity} -{' '}
                {formatCurrency(product.price * product.quantity)}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentMethod}>
              {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Đã thanh toán online'}
            </Text>
            <Text style={styles.deliveryFee}>Phí giao hàng: {formatCurrency(order.fee)}</Text>
          </View>
          <Text style={styles.totalPrice}>{formatCurrency(order.total_price)}</Text>
        </View>

        {/* Action Buttons */}
        {type === 'new' && order.status === 'pending' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptOrder}>
              <Text style={styles.buttonText}>Nhận đơn</Text>
            </TouchableOpacity>
          </View>
        )}
        {type === 'my' && order.status === 'processing' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.completeButton} onPress={handleCompleteOrder}>
              <Text style={styles.buttonText}>Thành Công</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.failedButton} onPress={handleFailedDelivery}>
              <Text style={styles.buttonText}>Không thành công</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default OrderDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#4A90E2',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  userIcon: {
    width: 24,
    height: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    margin: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dateOrder: {
    fontSize: 14,
    color: '#757575',
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  customerInfo: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#616161',
  },
  productInfo: {
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productItem: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  paymentInfo: {
    flexDirection: 'column',
  },
  paymentMethod: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 2,
  },
  deliveryFee: {
    fontSize: 13,
    color: '#757575',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  failedButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});