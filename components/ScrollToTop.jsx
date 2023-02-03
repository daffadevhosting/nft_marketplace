import React, { useState, useEffect } from 'react';
import { FaAngleUp } from 'react-icons/fa';
import css from "../styles/css.module.scss";

const ScrollToTop = () => {
	const [showTopBtn, setShowTopBtn] = useState(false);

	useEffect(() => {
		window.addEventListener('scroll', () => {
			if (window.scrollY > 400) {
				setShowTopBtn(true);
			} else {
				setShowTopBtn(false);
			}
		});
	}, []);

	const goToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	};

	return (
		<div className={css.top_to_btm}>
			{showTopBtn && (
				<FaAngleUp className={`${css.icon_position} ${css.icon_style}`} onClick={goToTop} />
			)}
		</div>
	);
};

export default ScrollToTop;
