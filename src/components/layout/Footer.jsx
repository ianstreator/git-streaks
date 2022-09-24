function Footer() {
  const footerYear = new Date().getFullYear();
  return (
    <footer className="footer p-5 bg-gray-700 text-footer-content footer-center">
      <div>
        <p>Copyright &copy; {footerYear}</p>
      </div>
    </footer>
  );
}

export default Footer;
