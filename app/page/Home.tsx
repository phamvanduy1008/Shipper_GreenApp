import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ipAddess } from '../constans/ip';

export interface ShipperInfo {
  _id?: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  avatar?: string;
  isActive: boolean;
  assignedOrders: {
    sellers: string;
    status: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderStats {
  newOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

const Home: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [shipperInfo, setShipperInfo] = useState<ShipperInfo | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    newOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchShipperInfo = useCallback(async () => {
    try {
      const user = await AsyncStorage.getItem('shipperInfo');
      console.log('shipperInfo:', user);
      if (!user) {
        setIsAuthenticated(false);
      } else {
        const parsedUser = JSON.parse(user);
        setShipperInfo(parsedUser);
      }
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
      setIsAuthenticated(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated || !shipperInfo?._id) return;

    try {
      const [resOrder, resDelivered] = await Promise.all([
        fetch(`${ipAddess}/api/shipper/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`${ipAddess}/api/shipper_status/${shipperInfo?._id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);

      if (!resOrder.ok || !resDelivered.ok) {
        console.error('Error fetching data');
        return;
      }

      const dataOrder = await resOrder.json();
      const dataDelivered = await resDelivered.json();
      console.log("dataDelivered", dataDelivered.processing);

      setOrderStats({
        newOrders: dataOrder.length,
        processingOrders: dataDelivered.processing?.length || 0,
        completedOrders: dataDelivered.delivered?.length || 0,
        cancelledOrders: dataDelivered.cancelled?.length || 0,
      });
    } catch (error) {
    }
  }, [isAuthenticated, shipperInfo?._id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchShipperInfo(), fetchStats()]);
    setRefreshing(false);
  }, [fetchShipperInfo, fetchStats]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  if (!isAuthenticated) {
    console.log('Redirecting to login');
    return <Redirect href="/auth/login" />;
  }

  const toacc = async () => {
    router.push("/page/account/profile")
  };

  const handleClick = (type: 'new' | 'my' | 'done' | 'cancelled' | 'notifications') => {
    const shipperId = shipperInfo?._id;
    if (!shipperId) return;

    if (type === 'new') {
      router.push({ pathname: './order/neworder', params: { shipperId } });
    } else if (type === 'my') {
      router.push({ pathname: './order/myorder', params: { shipperId } });
    } else if (type === 'done') {
      router.push({ pathname: './order/doneorder', params: { shipperId } });
    } else if (type === 'cancelled') {
      router.push({ pathname: './order/cancelorder', params: { shipperId } });
    } else if (type === 'notifications') {
      router.push({ pathname: './notifications', params: { shipperId } });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#3B82F6', '#1E40AF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Ionicons name="layers-outline" size={24} color="#FFFFFF" />
              <Text style={styles.headerTitle}>
                Xin chào, {shipperInfo?.full_name || 'Shipper'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toacc}
              style={styles.profileButton}
            >
              <View style={styles.userButton}>
                {shipperInfo?.avatar ? (
                  <Image
                    source={{ uri: shipperInfo.avatar }}
                    style={styles.userAvatar}
                  />
                ) : (
                  <View style={styles.defaultAvatar}>
                    <Text style={styles.avatarText}>
                      {shipperInfo?.full_name?.charAt(0) || 'S'}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Main content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3B82F6']} 
            tintColor="#3B82F6"
          />
        }
      >
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeCardContent}>
            <Text style={styles.welcomeText}>Bảng điều khiển</Text>
            <Text style={styles.welcomeSubtext}>
              Theo dõi và quản lý các đơn hàng của bạn
            </Text>
          </View>
          <View style={styles.welcomeIconContainer}>
            <Ionicons name="speedometer-outline" size={40} color="rgba(59, 130, 246, 0.7)" />
          </View>
        </View>

        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Quản lý đơn hàng</Text>
        </View>

        <View style={styles.statsContainer}>
          {/* New Orders */}
          <View style={styles.statCardWrapper}>
            <TouchableOpacity 
              style={[styles.statCard, styles.newOrderCard]}
              onPress={() => handleClick('new')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, styles.blueIconBg]}>
                <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>{orderStats.newOrders}</Text>
              <Text style={styles.statLabel}>Đơn hàng mới</Text>
            </TouchableOpacity>
          </View>

          {/* Processing Orders */}
          <View style={styles.statCardWrapper}>
            <TouchableOpacity 
              style={[styles.statCard, styles.processingOrderCard]}
              onPress={() => handleClick('my')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, styles.orangeIconBg]}>
                <Ionicons name="bicycle-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>{orderStats.processingOrders}</Text>
              <Text style={styles.statLabel}>Đang giao</Text>
            </TouchableOpacity>
          </View>

          {/* Completed Orders */}
          <View style={styles.statCardWrapper}>
            <TouchableOpacity 
              style={[styles.statCard, styles.completedOrderCard]}
              onPress={() => handleClick('done')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, styles.greenIconBg]}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>{orderStats.completedOrders}</Text>
              <Text style={styles.statLabel}>Hoàn thành</Text>
            </TouchableOpacity>
          </View>

          {/* Cancelled Orders */}
          <View style={styles.statCardWrapper}>
            <TouchableOpacity 
              style={[styles.statCard, styles.cancelledOrderCard]}
              onPress={() => handleClick('cancelled')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, styles.redIconBg]}>
                <Ionicons name="close-circle-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>{orderStats.cancelledOrders}</Text>
              <Text style={styles.statLabel}>Đã hủy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick stats summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Thống kê nhanh</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tổng đơn hàng</Text>
              <Text style={styles.summaryValue}>
                {orderStats.newOrders + orderStats.processingOrders + 
                orderStats.completedOrders + orderStats.cancelledOrders}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tỷ lệ hoàn thành</Text>
              <Text style={styles.summaryValue}>
                { Math.round(
                      (orderStats.completedOrders / 
                        (orderStats.completedOrders + orderStats.cancelledOrders)) * 100
                    ) + '%'}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  headerContainer: {
    width: '100%',
    zIndex: 10,
  },
  gradientHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  profileButton: {
    padding: 4,
  },
  userButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  welcomeCardContent: {
    flex: 1,
    paddingRight: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  welcomeIconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: 'rgba(219, 234, 254, 0.7)',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  statCardWrapper: {
    width: '50%',
    padding: 4,
    marginBottom: 8,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    height: 120,
    justifyContent: 'center',
    borderLeftWidth: 3,
  },
  newOrderCard: {
    borderLeftColor: '#3B82F6',
  },
  processingOrderCard: {
    borderLeftColor: '#F59E0B',
  },
  completedOrderCard: {
    borderLeftColor: '#10B981',
  },
  cancelledOrderCard: {
    borderLeftColor: '#EF4444',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  blueIconBg: {
    backgroundColor: '#3B82F6',
  },
  orangeIconBg: {
    backgroundColor: '#F59E0B',
  },
  greenIconBg: {
    backgroundColor: '#10B981',
  },
  redIconBg: {
    backgroundColor: '#EF4444',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 15,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
  },
});