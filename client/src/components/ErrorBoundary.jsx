import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="route-error" role="alert">
          <p>Không thể tải giao diện này.</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Tải lại trang
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
