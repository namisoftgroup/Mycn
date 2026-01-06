import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink, Outlet } from "react-router";
import useLogout from "../hooks/auth/useLogout";

export default function Profile() {
  const { t } = useTranslation();
  const { logout } = useLogout(t);
  const { client } = useSelector((state) => state.clientData);
  const avatar =
    client?.first_name?.split("")[0].toUpperCase() +
    client?.last_name?.split("")[0].toUpperCase();

  return (
    <section className="profile_section mt-80">
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-4 col-12 p-2">
            <div className="profile_sidebar">
              <div className="user">
                <div className="avatar">{avatar}</div>
                <div className="content">
                  <h6>{client?.first_name + " " + client?.last_name}</h6>
                  <span>{client?.email}</span>
                </div>
              </div>

              <div className="nav_links">
                <NavLink to="" end className="nav_link">
                  <i className="fa-regular fa-chart-line"></i>
                  {t("header.dashboard")}
                </NavLink>

                <NavLink to="expected-packages" className="nav_link">
                  <i className="fa-regular fa-box-taped"></i>
                  {t("profile.expectedPackages")}
                </NavLink>

                <NavLink to="new-packages" className="nav_link">
                  <i className="fa-regular fa-box-taped"></i>
                  {t("header.newPackages")}
                </NavLink>

                <NavLink to="my-shipments" className="nav_link">
                  <i className="fa-regular fa-truck"></i>
                  {t("header.myShipments")}
                </NavLink>

                <NavLink to="my-transactions" className="nav_link">
                  <i className="fa-solid fa-dollar-sign"></i>
                  {t("header.myTransactions")}
                </NavLink>

                <NavLink to="notifications" className="nav_link">
                  <i className="fa-regular fa-bell"></i>
                  {t("header.notifications")}
                </NavLink>

                <NavLink to="my-addresses" className="nav_link">
                  <i className="fa-regular fa-location-dot"></i>
                  {t("header.myAddresses")}
                </NavLink>
                <NavLink to="messages" className="nav_link">
                  <i className="fa-regular fa-location-dot"></i>
                  {t("header.messages")}
                </NavLink>

                <div className="nav_link" onClick={logout}>
                  <i className="fa-regular fa-email"></i>
                  {t("header.logout")}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-9 col-md-4 col-12 p-0">
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  );
}
