import { useState, useEffect } from 'react';
import {uuid} from "@walletconnect/utils";

export function useLocalSalt() {
  const [salt, setSalt] = useState("");

  useEffect(() => {
    function handleSalt() {
      let local = localStorage.getItem("salt");
      if (!local) {
        local = uuid()
        localStorage.setItem("salt", JSON.stringify(local));
      }
      setSalt(local);
    }

    function resetSalt() {
      const local = uuid()
      setSalt(local);
    }


    return () => {
      handleSalt()
    };
  });

  return salt;
}

