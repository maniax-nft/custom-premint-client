import React, { useEffect, useRef, useState } from "react";
import "./index.css";

import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import classNames from "classnames";
import ReCAPTCHA from "react-google-recaptcha";

import Logo from "../../assets/discord.svg";
import { authenticateDiscord } from "../../services";
import initUser from "../utils/initUser";
import setLoading from "../utils/loading";

const ConnectDiscord = () => {
  const discordName = useSelector((state) => state.discordName);
  const [success, setSuccess] = useState(false);
  const recaptchaRef = useRef(null);

  const onClick = () => {
    if (!discordName) {
      window.location.replace(process.env.REACT_APP_DISCORD_AUTH_URL);
    }
  };

  const clearUrlParams = () => {
    const currURL = window.location.href;
    const url = currURL.split(window.location.host)[1].split("?")[0];
    window.history.pushState({}, document.title, url);
  };

  const showSuccess = () => {
    setLoading(false)
    clearUrlParams();
    setSuccess(true);
    toast.success(`Discord successfully connected, ${discordName}`);
    const canvas = document.getElementById("confetti");
    const myConfetti = window.confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });
    myConfetti({
      particleCount: 300,
      spread: 400,
    });
    setTimeout(() => {
      window.confetti.reset();
      setSuccess(false);
    }, 1500);
  }

  useEffect(() => {
    const authenticate = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code) {
        try {
          setLoading(true)
          const captchaToken = await recaptchaRef.current.executeAsync();
          recaptchaRef.current.reset();
          await authenticateDiscord({code, captchaToken});
          await initUser();
         showSuccess()
        } catch (e) {
          setLoading(false)
          toast.error(e.message);
          clearUrlParams();
        }
      }
    };
    authenticate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="connect_discord">
       <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={process.env.REACT_APP_RECAPTCHA_KEY}
        size="invisible"
      />
      <div
        className={classNames({
          connect_discord__button: true,
          connect_discord__button__disabled: discordName,
        })}
        onClick={onClick}
      >
        <img
          src={Logo}
          alt="discord"
          className="connect_discord__button__logo"
        />
        <div className="connect_discord__button__text">Connect Discord</div>
      </div>
      {discordName && (
        <div className="connect_discord__success">
          {`- You are successfully connected, ${discordName}!`}
        </div>
      )}
      {success && <canvas id="confetti"></canvas>}
    </div>
  );
};

export default ConnectDiscord;
