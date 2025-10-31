'use client';

import Link from 'next/link';
import React from 'react';

const SupportPage = () => {
  return (
    <>
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
              <li className="nav-item"><Link className="nav-link" href="/pricing">Pricing</Link></li>
              <li className="nav-item"><Link className="nav-link" href="/support">Support</Link></li>
              <li className="nav-item"><Link className="nav-link" href="/admin">Admin</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      <header className="masthead" style={{ paddingTop: '10rem', paddingBottom: '5rem' }}>
        <div className="container px-4 px-lg-5 d-flex h-100 align-items-center justify-content-center">
          <div className="d-flex justify-content-center">
            <div className="text-center">
              <h1 className="mx-auto my-0 text-uppercase">Support Center</h1>
              <h2 className="text-white-50 mx-auto mt-2 mb-5">How can we help you?</h2>
              <div className="input-group mb-3">
                <input type="text" className="form-control form-control-lg" placeholder="Search for answers..." />
                <button className="btn btn-primary" type="button"><i className="fas fa-search"></i></button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="support-topics-section bg-light" id="topics">
        <div className="container px-4 px-lg-5">
          <div className="row gx-0 mb-4 mb-lg-5 align-items-center">
            <div className="col-xl-8 col-lg-7">
                <h2 className="text-black mb-4">Support Topics</h2>
            </div>
          </div>
          <div className="row gx-4 gx-lg-5">
            <div className="col-md-4 mb-5">
              <div className="card h-100">
                <div className="card-body">
                  <h4 className="card-title">Registration</h4>
                  <p className="card-text">Help with signing up, creating a profile, and managing your registration.</p>
                </div>
                <div className="card-footer"><a className="btn btn-primary btn-sm" href="#!">More Info</a></div>
              </div>
            </div>
            <div className="col-md-4 mb-5">
              <div className="card h-100">
                <div className="card-body">
                  <h4 className="card-title">Payments & Billing</h4>
                  <p className="card-text">Questions about payments, invoices, refunds, and coupons.</p>
                </div>
                <div className="card-footer"><a className="btn btn-primary btn-sm" href="#!">More Info</a></div>
              </div>
            </div>
            <div className="col-md-4 mb-5">
              <div className="card h-100">
                <div className="card-body">
                  <h4 className="card-title">Account Management</h4>
                  <p className="card-text">Help with updating your profile, changing your password, and managing your account settings.</p>
                </div>
                <div className="card-footer"><a className="btn btn-primary btn-sm" href="#!">More Info</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="container px-4 px-lg-5">
            <h2 className="text-black mb-4 text-center">Frequently Asked Questions</h2>
            <div className="accordion" id="faqAccordion">
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingOne">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    How do I register for the league?
                  </button>
                </h2>
                <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
                  <div className="accordion-body">
                    You can register by visiting the <a href="/pricing">pricing page</a> and selecting a registration plan. From there, you will be guided through the registration process.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingTwo">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                    What payment methods are accepted?
                  </button>
                </h2>
                <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
                  <div className="accordion-body">
                    We accept all major credit cards, as well as payments through Klarna and Affirm.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingThree">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                    How do I reset my password?
                  </button>
                </h2>
                <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
                  <div className="accordion-body">
                    You can reset your password by visiting the login page and clicking the "Forgot Password" link.
                  </div>
                </div>
              </div>
            </div>
        </div>
      </section>

      <section className="contact-section bg-black" id="contact">
        <div className="container px-4 px-lg-5">
            <div className="row gx-4 gx-lg-5 justify-content-center">
                <div className="col-lg-8 col-xl-6 text-center">
                    <h2 className="mt-0 text-white">Still have questions?</h2>
                    <hr className="divider" />
                    <p className="text-white-75 mb-5">Send us a message and we will get back to you as soon as possible!</p>
                </div>
            </div>
            <div className="row gx-4 gx-lg-5 justify-content-center mb-5">
                <div className="col-lg-6">
                    <form id="contactForm">
                        <div className="form-floating mb-3">
                            <input className="form-control" id="name" type="text" placeholder="Enter your name..." />
                            <label htmlFor="name">Full name</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input className="form-control" id="email" type="email" placeholder="name@example.com" />
                            <label htmlFor="email">Email address</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input className="form-control" id="subject" type="text" placeholder="Subject" />
                            <label htmlFor="subject">Subject</label>
                        </div>
                        <div className="form-floating mb-3">
                            <textarea className="form-control" id="message" placeholder="Enter your message here..." style={{height: '10rem'}}></textarea>
                            <label htmlFor="message">Message</label>
                        </div>
                        <div className="d-grid"><button className="btn btn-primary btn-xl" id="submitButton" type="submit">Submit</button></div>
                    </form>
                </div>
            </div>
        </div>
      </section>

      <footer className="footer bg-black small text-center text-white-50">
        <div className="container px-4 px-lg-5">
          Copyright &copy; All Pro Sports 2024
        </div>
      </footer>
    </>
  );
};

export default SupportPage;
