# Frontend — Routing

## Purpose
This document details the client-side routing setup configured in **hotel-frontend**.

---

## Router Configuration

Client-side routing is powered by `react-router-dom` 6 in [App.jsx](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/hotel-frontend/src/App.jsx):

```jsx
<Router>
  <div className="app-layout">
    <Sidebar />
    <div className="main-content-wrapper">
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
      </Routes>
    </div>
  </div>
</Router>
```

- Navigation links inside [Sidebar.jsx](file:///c:/Users/kadiw/OneDrive/Desktop/BookInn/hotel-frontend/src/components/Sidebar.jsx) use `<NavLink>` to prevent full browser reloads and provide active tab highlighting.
