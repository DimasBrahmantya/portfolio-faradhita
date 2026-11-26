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
        <div
          style={{
            position: 'absolute',
            top: 22,
            right: 26,
            fontSize: 34,
            color: '#fff7fa',
            display: 'flex',
          }}
        >
          ✦
        </div>
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
