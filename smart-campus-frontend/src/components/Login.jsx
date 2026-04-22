import React from 'react';

export default function Login({ oauthEntryUrl, error }) {
  return (
    <div className="screen-center login-shell">
      <div className="card login-card hero-card">
        <div className="login-hero-inner">
          <div className="login-left">
            <div className="brand">
              <div className="logo" aria-hidden>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="22" height="22" rx="5" fill="#0A4A74" />
                  <path d="M6 16L10 8L14 16" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="badge">Smart Campus</p>
                <h1 className="hero-title">Operations Hub</h1>
              </div>
            </div>

            <p className="muted-text hero-sub">
              Secure staff and student operations tools — sign in with your institutional Google account to continue.
            </p>

            <a className="google-btn google-hero" href={oauthEntryUrl} aria-label="Sign in with Google">
              <span className="google-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#EA4335" d="M12 11.8v2.8h4.7c-.2 1.2-.9 2.3-1.9 3l3 2.3C20.5 19 21.5 16.6 21.5 14c0-1.4-.3-2.6-.8-3.7H12z"/>
                  <path fill="#34A853" d="M6.3 13.2c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8L3.2 7.3C2.3 8.9 2 10.4 2 12s.3 3.1 1.2 4.7l3.1-3.5z"/>
                  <path fill="#4A90E2" d="M12 6.2c1 0 1.9.3 2.6.8l2-2C16.2 3.1 14.2 2 12 2 9.5 2 7.3 3 5.9 4.7l3 2.5C10 6.8 11 6.2 12 6.2z"/>
                  <path fill="#FBBC05" d="M21.5 7.3l-9.5 4.5c-.6-.4-1.3-.6-2-.6-1.1 0-2.2.4-3 1l-3-2.5C4.8 5.9 8 4 12 4c2.2 0 4.2 1.1 5.5 3.3z"/>
                </svg>
              </span>
              <span>Continue with Google</span>
            </a>

            <p className="muted-text small">You will be redirected to your institution's Google sign-in page. We never share your credentials.</p>
            {error ? <p className="error-text" role="alert">{error}</p> : null}
          </div>

          <div className="login-right" aria-hidden>
            <svg className="hero-blob" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(300,300)">
                <path d="M120,-150C160,-120,220,-90,240,-40C260,10,240,80,200,120C160,160,100,170,40,170C-20,170,-80,160,-130,130C-180,100,-220,60,-240,0C-260,-60,-260,-120,-220,-150C-180,-180,-120,-180,-70,-170C-20,-160,20,-150,120,-150Z" fill="#0a4a74" opacity="0.14"/>
                <path d="M100,-120C130,-100,180,-80,200,-40C220,0,200,60,160,90C120,120,60,120,10,120C-40,120,-80,110,-120,90C-160,70,-190,30,-200,-20C-210,-70,-210,-120,-170,-140C-130,-160,-70,-160,-30,-150C10,-140,70,-130,100,-120Z" fill="#0f6c8b" opacity="0.12"/>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
