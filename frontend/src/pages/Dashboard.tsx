import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Tour Operator CRM</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Çıkış Yap
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.welcomeCard}>
          <h2>Hoş Geldiniz!</h2>
          <div style={styles.userInfo}>
            <p>
              <strong>Ad Soyad:</strong> {user?.firstName} {user?.lastName}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Rol:</strong> <span style={styles.roleBadge}>{user?.role}</span>
            </p>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.moduleCard}>
            <h3>Rezervasyonlar</h3>
            <p>Tüm rezervasyonları görüntüle ve yönet</p>
            <button style={styles.moduleButton}>Yakında</button>
          </div>

          <div style={styles.moduleCard}>
            <h3>Turlar</h3>
            <p>Tur programlarını oluştur ve düzenle</p>
            <button style={styles.moduleButton}>Yakında</button>
          </div>

          <div style={styles.moduleCard}>
            <h3>Kaynaklar</h3>
            <p>Otel, araç ve rehber yönetimi</p>
            <button style={styles.moduleButton}>Yakında</button>
          </div>

          <div style={styles.moduleCard}>
            <h3>Müşteriler</h3>
            <p>Müşteri veritabanı ve CRM</p>
            <button style={styles.moduleButton}>Yakında</button>
          </div>

          <div style={styles.moduleCard}>
            <h3>Finans</h3>
            <p>Faturalar, ödemeler ve raporlar</p>
            <button style={styles.moduleButton}>Yakında</button>
          </div>

          <div style={styles.moduleCard}>
            <h3>Ayarlar</h3>
            <p>Kullanıcı ve sistem ayarları</p>
            <button style={styles.moduleButton}>Yakında</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  logoutButton: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.2)',
    border: '2px solid white',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  content: {
    padding: '40px',
  },
  welcomeCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  userInfo: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  roleBadge: {
    background: '#667eea',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  moduleCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  moduleButton: {
    marginTop: '15px',
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    width: '100%',
    transition: 'background 0.2s',
  },
};

export default Dashboard;
