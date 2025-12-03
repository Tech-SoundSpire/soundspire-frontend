import { type fontSizeKeys, getFontSize } from "@/utils/getFontSize";
import { fontKey, getFontClass } from "@/utils/getFontClass";
export interface BaseTextProps {
    wrapper?:
        | "p"
        | "blockquote"
        | "span"
        | "time"
        | "cite"
        | "code"
        | "figcaption"
        | "footer";
    children: React.ReactNode;
    className?: string;
    fontSize?: fontSizeKeys | "inherit";
    textColor?: string;
    fontWeight?: number | string;
    dateTime?: string;
    textAlign?: "left" | "right" | "center" | "inherit";
    textDecoration?: string;
    style?: React.CSSProperties;
    fontStyle?: "italic" | "normal" | "inherit";
    textSelectionBackgroundColor?: string;
    textSelectionColor?: string;
    fontName?: fontKey;
    id?: string;
}
const BaseText = ({
    wrapper = "p",
    children,
    className = "",
    fontSize = "inherit",
    textColor = "inherit",
    fontWeight = "inherit",
    dateTime,
    textAlign = "inherit",
    textDecoration = "inherit",
    style,
    fontStyle = "inherit",
    textSelectionBackgroundColor,
    textSelectionColor,
    fontName = "arial",
    id,
}: BaseTextProps) => {
    const TextWrapper = wrapper;
    const fontSizeVariable =
        fontSize === "inherit" ? "inherit" : getFontSize(fontSize);
    const fontClass = getFontClass(fontName);
    return (
        <TextWrapper
            className={`text ${fontClass} ${className}`}
            style={
                {
                    ...style,
                    fontSize: fontSizeVariable,
                    color: textColor,
                    fontWeight,
                    textAlign,
                    textDecoration,
                    fontStyle,
                    "--selection-bg": textSelectionBackgroundColor,
                    "--selection-color": textSelectionColor,
                } as React.CSSProperties
            }
            dateTime={dateTime}
            id={id}
        >
            {children}
        </TextWrapper>
    );
};
export default BaseText;
