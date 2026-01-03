import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import useGetSettings from "../hooks/settings/useGetSettings";

export default function Address() {
  const { t } = useTranslation();
  const { data: settings } = useGetSettings();
  const [copiedField, setCopiedField] = useState(null);
  const [hoveredHint, setHoveredHint] = useState(false);

  const handleCopy = (value, fieldName) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const { client } = useSelector((state) => state.clientData);
  // const clientName = `${(
  //   (client?.first_name?.[0] ?? "") + (client?.last_name?.[0] ?? "")
  // ).toUpperCase()} ${client?.unique_id}`;
  const fullName = `${client?.first_name ?? ""} ${
    client?.last_name ?? ""
  }`.trim();

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((name) => name[0].toUpperCase())
      .join("") + client?.unique_id;

  // Special grouped row for street, address line 2, and hint
  const streetRow = {
    label: t("addressFields.street"),
    values: [
      {
        key: "shipping_address",
        value: `${settings?.shipping_address} `,
      },
      // { key: "unique_id", value: client?.unique_id },
      { key: "address_hint", value: settings?.address_hint, isHint: true },
    ],
  };
  console.log(settings);

  // Other address fields
  const otherFields = [
    { label: t("addressFields.recipient"), value: initials },
    { label: t("addressFields.district"), value: settings?.district },
    { label: t("addressFields.city"), value: settings?.city },
    { label: t("addressFields.province"), value: settings?.province },
    { label: t("addressFields.country"), value: settings?.country },
    { label: t("addressFields.zipCode"), value: settings?.zip_code },
    { label: t("addressFields.phone"), value: settings?.shipping_phone },
    { label: t("addressFields.email"), value: settings?.email },
  ];

  const addressContent = t("profile.address", { returnObjects: true });

  return (
    <div className="address">
      <div className="row">
        <div className="col-lg-6 col-12 p-2">
          <div className="content">
            <h3>{t("profile.welcomeText")}</h3>
            {addressContent.sections.map((section, index) => (
              <p key={index}>{section}</p>
            ))}
            <div className="benefits-section">
              <h4>{addressContent.benefits.heading}</h4>
              <ul>
                {addressContent.benefits.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p>{addressContent.benefits.footer}</p>
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-12 p-2">
          <div className="address_card">
            <h4>
              {addressContent.title}{" "}
              <img src="/images/logo.svg" alt="MYCN Logo" />
            </h4>
            <ul>
              {/* Recipient Field */}
              {otherFields.slice(0, 1).map((field, index) => (
                <li key={index}>
                  <span>{field.label}:</span>
                  <b
                    className="copy-wrapper"
                    onClick={() => handleCopy(field.value, `field-${index}`)}
                  >
                    {field.value}
                    <i className="fa-regular fa-copy copy-icon"></i>
                    <span className="tooltip">
                      {copiedField === `field-${index}`
                        ? t("common.copied")
                        : t("common.copy")}
                    </span>
                  </b>
                </li>
              ))}

              {/* Street Row with 3 values */}
              <li className="street-row">
                <span>{streetRow.label}:</span>
                <div className="street-values">
                  {streetRow.values.map((item, idx) =>
                    item.isHint ? (
                      <div
                        key={idx}
                        className="hint-container"
                        onMouseEnter={() => setHoveredHint(true)}
                        onMouseLeave={() => setHoveredHint(false)}
                      >
                        <i className="fa-solid fa-circle-info hint-icon"></i>
                        {hoveredHint && (
                          <span className="hint-popup">{item.value}</span>
                        )}
                      </div>
                    ) : (
                      <div key={idx} className="value-item">
                        <b
                          className="copy-wrapper"
                          onClick={() => handleCopy(item.value, item.key)}
                        >
                          {item.value}
                          <i className="fa-regular fa-copy copy-icon"></i>
                          <span className="tooltip">
                            {copiedField === item.key
                              ? t("common.copied")
                              : t("common.copy")}
                          </span>
                        </b>
                      </div>
                    )
                  )}
                </div>
              </li>

              {/* Other Fields */}
              {otherFields.slice(1).map((field, index) => (
                <li key={index}>
                  <span>{field.label}:</span>
                  <b
                    className="copy-wrapper"
                    onClick={() => handleCopy(field.value, `field-${index}`)}
                  >
                    {field.value}
                    <i className="fa-regular fa-copy copy-icon"></i>
                    <span className="tooltip">
                      {copiedField === `field-${index}`
                        ? t("common.copied")
                        : t("common.copy")}
                    </span>
                  </b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
