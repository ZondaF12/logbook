import * as React from "react";
import Svg, { Path } from "react-native-svg";

const MotSvgComponent = (props: any) => {
    const { color } = props;

    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            {...props}
            viewBox="0 0 85.539 74.176"
        >
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                fill={color}
                d="M42.68 48.609 32.234 66.793h21.07L42.68 48.609zm8.82-15.3h20.887L61.945 15.48 51.5 33.309zM23.586 16.742l-9.727 16.566h20.172l-9.902-16.93-.543.364zm19.273 16.567L23.586 0 0 40.863h38.352L18.91 74.176h47.719L47.176 40.863h38.363L61.945 0 42.68 33.129l.179.18z"
            />
        </Svg>
    );
};

export default MotSvgComponent;
