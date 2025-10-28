const NotFound = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0A0E27',
      padding: '20px'
    }}>
      <div className="panel" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="panel-header" style={{ background: '#FF0000', color: '#FFF' }}>
          404 ERROR
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ 
            fontSize: '72px', 
            fontWeight: 'bold', 
            color: '#FF6B00',
            fontFamily: 'Courier New, monospace',
            marginBottom: '16px'
          }}>
            404
          </div>
          <p style={{ 
            color: '#B0B0B0', 
            fontSize: '18px',
            marginBottom: '24px',
            fontFamily: 'Courier New, monospace'
          }}>
            PAGE NOT FOUND
          </p>
          <p style={{ color: '#B0B0B0', fontSize: '14px', marginBottom: '32px' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <a 
            href="/"
            className="btn-primary"
            style={{
              display: 'inline-block',
              textDecoration: 'none'
            }}
          >
            RETURN HOME
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
