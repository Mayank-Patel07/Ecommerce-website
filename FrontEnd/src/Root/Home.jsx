import React from "react";
import "./Root.css";
import { Link } from "react-router-dom";

export default function Home() {
  const color_text = "#eee8d3";
  return (
    <>
      <section class="Home">
        <h1 class="heading">
          <span className="text-center " style={{ color: color_text }}>
            Welcome to BrainsKart
          </span>
        </h1>
        <p class="HomePara" style={{ color: color_text }}>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Provident ut
          explicabo repellendus! Repudiandae accusamus quas placeat ratione
          necessitatibus voluptates sunt earum laudantium saepe aliquid illo
          officia illum nobis, debitis iste ipsam possimus molestiae tempore quo
          ea eos architecto. Quis, quae rem. Molestias, rem? Consequuntur
          aspernatur tempore reiciendis molestias, delectus dolor.
        </p>
        <div className="mt-1">
          <button class="button mt-1 text-black" role="button">
            <Link
              to="/allproducts"
              style={{ textDecoration: "none", color: "black" }}
            >
              Shop Now
            </Link>
          </button>
        </div>
      </section>
    </>
  );
}
