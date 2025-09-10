'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light fixed-top" id="mainNav">
        <div className="container px-4 px-lg-5">
          <Link className="navbar-brand" href="/">All Pro Sports</Link>
          <button className="navbar-toggler navbar-toggler-right" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
            Menu
            <i className="fas fa-bars"></i>
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link" href="/leaderboard">League</Link></li>
              <li className="nav-item"><Link className="nav-link" href="/leaderboard">Leaderboard</Link></li>
              <li className="nav-item"><Link className="nav-link" href="/register">Pricing</Link></li>
              <li className="nav-item"><Link className="nav-link" href="/admin">Admin</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Masthead */}
      <header className="masthead">
        {/* Video Background */}
        <div className="video-background">
          <video 
            id="video1" 
            className="video-slide active" 
            autoPlay 
            muted 
            playsInline
            loop={false}
            style={{ display: 'block' }}
            onLoadedData={() => console.log('Video 1 loaded')}
            onError={(e) => console.error('Video 1 error:', e)}
            onEnded={() => {
              const videos = document.querySelectorAll('.video-slide') as NodeListOf<HTMLVideoElement>;
              const current = document.querySelector('.video-slide.active') as HTMLVideoElement;
              const currentIndex = Array.from(videos).indexOf(current);
              const nextIndex = (currentIndex + 1) % videos.length;
              
              // Check if user prefers reduced motion
              const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              const transitionTime = prefersReducedMotion ? 200 : (window.innerWidth <= 768 ? 500 : 1000);
              
              // Fade out current video
              current.style.opacity = '0';
              
              setTimeout(() => {
                current.classList.remove('active');
                videos[nextIndex].classList.add('active');
                videos[nextIndex].currentTime = 0;
                videos[nextIndex].style.opacity = '1';
                videos[nextIndex].play();
              }, transitionTime);
            }}
          >
            <source src="/img/2249402-uhd_3840_2160_24fps.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <video 
            id="video2" 
            className="video-slide" 
            muted 
            playsInline
            loop={false}
            style={{ display: 'block' }}
            onLoadedData={() => console.log('Video 2 loaded')}
            onError={(e) => console.error('Video 2 error:', e)}
            onEnded={() => {
              const videos = document.querySelectorAll('.video-slide') as NodeListOf<HTMLVideoElement>;
              const current = document.querySelector('.video-slide.active') as HTMLVideoElement;
              const currentIndex = Array.from(videos).indexOf(current);
              const nextIndex = (currentIndex + 1) % videos.length;
              
              // Check if user prefers reduced motion
              const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              const transitionTime = prefersReducedMotion ? 200 : (window.innerWidth <= 768 ? 500 : 1000);
              
              // Fade out current video
              current.style.opacity = '0';
              
              setTimeout(() => {
                current.classList.remove('active');
                videos[nextIndex].classList.add('active');
                videos[nextIndex].currentTime = 0;
                videos[nextIndex].style.opacity = '1';
                videos[nextIndex].play();
              }, transitionTime);
            }}
          >
            <source src="/img/2249402-uhd_3840_2160_24fps (1).mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <video 
            id="video3" 
            className="video-slide" 
            muted 
            playsInline
            loop={false}
            style={{ display: 'block' }}
            onLoadedData={() => console.log('Video 3 loaded')}
            onError={(e) => console.error('Video 3 error:', e)}
            onEnded={() => {
              const videos = document.querySelectorAll('.video-slide') as NodeListOf<HTMLVideoElement>;
              const current = document.querySelector('.video-slide.active') as HTMLVideoElement;
              const currentIndex = Array.from(videos).indexOf(current);
              const nextIndex = (currentIndex + 1) % videos.length;
              
              // Check if user prefers reduced motion
              const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              const transitionTime = prefersReducedMotion ? 200 : (window.innerWidth <= 768 ? 500 : 1000);
              
              // Fade out current video
              current.style.opacity = '0';
              
              setTimeout(() => {
                current.classList.remove('active');
                videos[nextIndex].classList.add('active');
                videos[nextIndex].currentTime = 0;
                videos[nextIndex].style.opacity = '1';
                videos[nextIndex].play();
              }, transitionTime);
            }}
          >
            <source src="/img/4112090-hd_1920_1080_25fps.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <video 
            id="video4" 
            className="video-slide" 
            muted 
            playsInline
            loop={false}
            style={{ display: 'block' }}
            onLoadedData={() => console.log('Video 4 loaded')}
            onError={(e) => console.error('Video 4 error:', e)}
            onEnded={() => {
              const videos = document.querySelectorAll('.video-slide') as NodeListOf<HTMLVideoElement>;
              const current = document.querySelector('.video-slide.active') as HTMLVideoElement;
              const currentIndex = Array.from(videos).indexOf(current);
              const nextIndex = (currentIndex + 1) % videos.length;
              
              // Check if user prefers reduced motion
              const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              const transitionTime = prefersReducedMotion ? 200 : (window.innerWidth <= 768 ? 500 : 1000);
              
              // Fade out current video
              current.style.opacity = '0';
              
              setTimeout(() => {
                current.classList.remove('active');
                videos[nextIndex].classList.add('active');
                videos[nextIndex].currentTime = 0;
                videos[nextIndex].style.opacity = '1';
                videos[nextIndex].play();
              }, transitionTime);
            }}
          >
            <source src="/img/7187055-hd_1920_1080_24fps.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay"></div>
        </div>
        
        <div className="container px-4 px-lg-5 d-flex h-100 align-items-center justify-content-center">
          <div className="d-flex justify-content-center">
            <div className="text-center">
              <h1 className="mx-auto my-0 text-uppercase">All Pro Sports</h1>
              <h2 className="text-white-50 mx-auto mt-2 mb-5">Elite athletic leagues with automated SMS updates, player profiles, and real-time notifications.</h2>
              <Link href="/pricing">
                <button className="btn btn-primary">Join League Now</button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* About */}
      <section className="about-section text-center" id="about">
        <div className="container px-4 px-lg-5">
          <div className="row gx-4 gx-lg-5 justify-content-center">
            <div className="col-lg-8">
              <h2 className="text-white mb-4">Professional Sports League Management</h2>
              <p className="text-white-50">
                All Pro Sports provides comprehensive league management with automated SMS notifications, 
                real-time player statistics, team standings, and seamless registration processes. 
                Join our community of elite athletes and experience sports management at its finest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signup */}
      <section className="signup-section" id="signup">
        <div className="container px-4 px-lg-5">
          <div className="row gx-4 gx-lg-5">
            <div className="col-md-10 col-lg-8 mx-auto text-center">
              <i className="far fa-paper-plane fa-2x mb-2 text-white"></i>
              <h2 className="text-white mb-5">Ready to Join the League?</h2>
              <div className="d-flex justify-content-center gap-3">
                <Link href="/pricing">
                  <button className="btn btn-primary">Player Registration</button>
                </Link>
                <Link href="/leaderboard">
                  <button className="btn btn-outline-light">View Leaderboard</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="contact-section bg-black">
        <div className="container px-4 px-lg-5">
          <div className="row gx-4 gx-lg-5">
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="card py-4 h-100">
                <div className="card-body text-center">
                  <i className="fas fa-map-marked-alt text-primary mb-2"></i>
                  <h4 className="text-uppercase m-0">Location</h4>
                  <hr className="my-4 mx-auto" />
                  <div className="small text-black-50">Multiple Venues Citywide</div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="card py-4 h-100">
                <div className="card-body text-center">
                  <i className="fas fa-envelope text-primary mb-2"></i>
                  <h4 className="text-uppercase m-0">Email</h4>
                  <hr className="my-4 mx-auto" />
                  <div className="small text-black-50">
                    <a href="mailto:info@allprosportsnc.com">info@allprosportsnc.com</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="card py-4 h-100">
                <div className="card-body text-center">
                  <i className="fas fa-mobile-alt text-primary mb-2"></i>
                  <h4 className="text-uppercase m-0">Phone</h4>
                  <hr className="my-4 mx-auto" />
                  <div className="small text-black-50">336-662-2855</div>
                </div>
              </div>
            </div>
          </div>
          <div className="social d-flex justify-content-center">
            <a className="mx-2" href="#!"><i className="fab fa-twitter"></i></a>
            <a className="mx-2" href="#!"><i className="fab fa-facebook-f"></i></a>
            <a className="mx-2" href="#!"><i className="fab fa-github"></i></a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-black small text-center text-white-50">
        <div className="container px-4 px-lg-5">
          Copyright &copy; All Pro Sports 2024
        </div>
      </footer>
    </>
  )
}
