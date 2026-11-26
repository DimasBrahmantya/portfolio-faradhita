import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 44,
          background: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 50%, #a61d35 100%)',
          position: 'relative',
          border: '4px solid rgba(255, 241, 245, 0.5)',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            top: 24,
            right: 26,
          }}
        >
          <path
            d="M12 1L14.8 9.2L23 12L14.8 14.8L12 23L9.2 14.8L1 12L9.2 9.2L12 1Z"
            fill="#fff7fa"
          />
        </svg>
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 110,
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#ffffff',
            lineHeight: 1,
            marginRight: 8,
            display: 'flex',
          }}
        >
          F
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
