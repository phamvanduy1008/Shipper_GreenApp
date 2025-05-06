import { ipAddess } from '@/app/constans/ip';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Định nghĩa interface cho dữ liệu đơn hàng
interface Product {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
  _id: string;
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

interface OrderListProps {
  type: 'new' | 'my' | 'done' | 'cancel';
}

const OrderList: React.FC<OrderListProps> = ({ type }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const router = useRouter();
  const { shipperId } = useLocalSearchParams();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`Fetching ${type} orders...`);

      let response;
      if (type === 'new') {
        response = await fetch(`${ipAddess}/api/shipper`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        if (!shipperId) {
          console.error('shipperId is missing');
          setOrders([]);
          return;
        }
        response = await fetch(`${ipAddess}/api/shipper_status/${shipperId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      console.log('API response:', data);

      if (response.ok) {
        let mappedOrders: Order[] = [];
        if (type === 'new' && Array.isArray(data)) {
          mappedOrders = data;
        } else if (type === 'my') {
          const processingOrders = data.processing || [];
          mappedOrders = processingOrders.map((item: any) => ({
            ...item.sellers,
            status: item.status,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }));
        } else if (type === 'done') {
          const deliveredOrders = data.delivered || [];
          mappedOrders = deliveredOrders.map((item: any) => ({
            ...item.sellers,
            status: item.status,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }));
        } else if (type === 'cancel') {
          const cancelledOrders = data.cancelled || [];
          mappedOrders = cancelledOrders.map((item: any) => ({
            ...item.sellers,
            status: item.status,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }));
        }
        console.log(`Successfully fetched ${mappedOrders.length} orders`);
        setOrders(mappedOrders);
      } else {
        console.error(`Error fetching ${type} orders:`, data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Network error:', error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('Loading completed');
    }
  }, [type, shipperId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    })
      .format(amount)
      .replace('₫', 'VNĐ');
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    console.log('Rendering card for order:', item);

    const cardAnimatedValue = new Animated.Value(1);
    const animatedStyle = {
      transform: [{ scale: cardAnimatedValue }],
    };

    const handleCardPressIn = () => {
      Animated.spring(cardAnimatedValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handleCardPressOut = () => {
      Animated.spring(cardAnimatedValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    const statusColor =
      type === 'new' || item.status === 'resolved'
        ? '#FFB74D'
        : item.status === 'processing'
        ? '#FFB74D'
        : item.status === 'delivered'
        ? '#4CAF50'
        : item.status === 'cancelled'
        ? '#F44336'
        : '#757575';
    const statusText =
      type === 'new' || item.status === 'resolved'
        ? 'Chờ lấy hàng'
        : item.status === 'processing'
        ? 'Chờ giao hàng'
        : item.status === 'delivered'
        ? 'Đã giao'
        : item.status === 'cancelled'
        ? 'Đã hủy'
        : 'Không xác định';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handleCardPressIn}
        onPressOut={handleCardPressOut}
        onPress={() => {
          if (type === 'new') {
            router.push(`./neworder/${item._id}`);
          } else if (type === 'done') {
            router.push(`./doneorder/${item._id}`);
          } else if (type === 'cancel') {
            router.push(`./cancelledorder/${item._id}`);
          } else {
            router.push(`./myorder/${item._id}`);
          }
        }}
      >
        <Animated.View style={[styles.card, animatedStyle]}>
          <View style={styles.cardHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderCode}>{item.orderCode}</Text>
              <Text style={styles.dateOrder}>{formatDate(item.dateOrder)}</Text>
            </View>
            <View style={[styles.statusContainer, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.full_name}</Text>
            <Text style={styles.customerAddress}>{item.address}</Text>
            <Text style={styles.customerPhone}>{item.phone}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentMethod}>
                {item.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Đã thanh toán online'}
              </Text>
              <Text style={styles.deliveryFee}>Phí giao hàng: {formatCurrency(item.fee)}</Text>
            </View>
            <Text style={styles.totalPrice}>{formatCurrency(item.total_price)}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  if (type === 'new' && !isAuthenticated) {
    console.log('Redirecting to login');
    return <Redirect href="/auth/login" />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header cố định */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {type === 'new'
            ? 'Đơn hàng mới'
            : type === 'done'
            ? 'Đơn hàng giao thành công'
            : type === 'cancel'
            ? 'Đơn hàng đã hủy'
            : 'Đơn hàng của bạn'}
        </Text>
        <TouchableOpacity
          style={styles.userButton}
          onPress={() => router.push('/page/account/profile')}
        >
          <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/user.png' }} style={styles.userIcon} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        extraData={orders}
        initialNumToRender={5}
        onEndReachedThreshold={0.5}
        onEndReached={() => console.log('End of list reached')}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4A90E2']} tintColor="#4A90E2" />
        }
        ListHeaderComponent={
          <Text style={styles.listHeader}>Danh sách đơn hàng ({orders.length})</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có đơn hàng nào!</Text>
          </View>
        }
      />
    </View>
  );
};

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
  listContainer: {
    padding: 16,
    flexGrow: 1,
    paddingTop: 20,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginVertical: 8,
    textAlign: 'center',
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
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  orderInfo: {
    flexDirection: 'column',
  },
  orderCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dateOrder: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  cardFooter: {
    flexDirection: 'row',
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
    marginLeft: 20,
  },
});

export default OrderList;