import { getFontSize, type fontSizeKeys } from "@/utils/getFontSize";
import { fontKey, getFontClass } from "@/utils/getFontClass";
export interface BaseHeadingProps {
    children: React.ReactNode;
    textColor?: string;
    fontSize?: fontSizeKeys;
    className?: string;
    style?: React.CSSProperties;
    fontStyle?: "italic" | "normal";
    textSelectionBackgroundColor?: string;
    textSelectionColor?: string;
    textAlign?: "center" | "left" | "right";
    fontWeight?: number | string;
    headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    fontName?: fontKey;
}
const BaseHeading = ({
    children,
    textColor = "#f0f0f0",
    className = "",
    fontSize = "heading",
    fontStyle = "normal",
    style,
    fontWeight = 700,
    textAlign = "center",
    textSelectionBackgroundColor,
    textSelectionColor,
    headingLevel = "h2",
    fontName = "arial",
}: BaseHeadingProps) => {
    const HeadingType = headingLevel;
    const fontSizeClass = getFontSize(fontSize);
    const fontClass = getFontClass(fontName);
    return (
        <HeadingType
            className={`heading ${fontClass} ${className}`}
            style={
                {
                    color: textColor,
                    fontWeight,
                    fontStyle,
                    fontSize: fontSizeClass,
                    textAlign,
                    "--selection-bg": textSelectionBackgroundColor,
                    "--selection-color": textSelectionColor,
                    ...style,
                } as React.CSSProperties
            }
        >
            {children}
        </HeadingType>
    );
};
export default BaseHeading;
