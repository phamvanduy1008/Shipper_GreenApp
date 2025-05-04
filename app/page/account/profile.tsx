import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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
    createdAt?: Date;
    updatedAt?: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const Profile: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [shipperInfo, setShipperInfo] = useState<ShipperInfo | null>(null);

  useEffect(() => {
    const fetchShipperInfo = async () => {
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
    };
    fetchShipperInfo();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('shipperInfo');
      setIsAuthenticated(false);
      setShipperInfo(null);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (!isAuthenticated) {
    console.log('Redirecting to login');
    return <Redirect href="/auth/login" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#3B82F6', '#1E40AF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Ionicons name="person-outline" size={24} color="#FFFFFF" />
              <Text style={styles.headerTitle}>Hồ sơ</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/page/Home')}
              style={styles.backButton}
            >
              <Ionicons name="home-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <Text style={styles.fullName}>{shipperInfo?.full_name || 'Shipper'}</Text>
          <Text style={styles.email}>{shipperInfo?.email || 'N/A'}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#3B82F6" />
            <Text style={styles.infoLabel}>Số điện thoại</Text>
            <Text style={styles.infoValue}>{shipperInfo?.phone || 'Chưa cập nhật'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#3B82F6" />
            <Text style={styles.infoLabel}>Trạng thái</Text>
            <Text style={styles.infoValue}>
              {shipperInfo?.isActive ? 'Hoạt động' : 'Không hoạt động'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#3B82F6" />
            <Text style={styles.infoLabel}>Ngày tạo</Text>
            <Text style={styles.infoValue}>
              {shipperInfo?.createdAt
                ? new Date(shipperInfo.createdAt).toLocaleDateString('vi-VN')
                : 'N/A'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    width: '100%',
    zIndex: 10,
  },
  gradientHeader: {
    paddingTop: Platform.OS === 'ios' ? 44 : 36,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  backButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fullName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2A44',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2A44',
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop:20
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});