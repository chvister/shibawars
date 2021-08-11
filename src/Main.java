import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.Objects;

public class Main {

	public static final int WIDTH = 256;
	public static final int HEIGHT = 256;

	public static void main(String[] args) throws IOException {

		final String backgrounds = "image_bases/backgrounds";
		final String shibas = "image_bases/shibas";
		final String chains = "image_bases/chains";

		final String output = "shibas";

		final int backgroundsLength = Objects.requireNonNull(new File(backgrounds).list()).length;
		final int shibasLength = Objects.requireNonNull(new File(shibas).list()).length;
		final int chainsLength = Objects.requireNonNull(new File(chains).list()).length;

		for (int bgI = 0; bgI < backgroundsLength; ++bgI) {
			for (int shibaI = 0; shibaI < shibasLength; ++shibaI) {
				for (int chainI = 0; chainI < chainsLength; ++chainI) {
					// load source images
					BufferedImage background = ImageIO.read(new File(backgrounds + "/" + bgI + ".png"));
					BufferedImage shiba = ImageIO.read(new File(shibas + "/" + shibaI + ".png"));
					BufferedImage chain = ImageIO.read(new File(chains + "/" + chainI + ".png"));

					BufferedImage combined = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_ARGB);

					// paint both images, preserving the alpha channels
					Graphics g = combined.getGraphics();
					g.drawImage(background, 0, 0, null);
					g.drawImage(shiba, 0, 0, null);
					g.drawImage(chain, 0, 0, null);

					g.dispose();

					// Save as new image
					ImageIO.write(combined, "PNG", new File(output, String.format("%d%d%d.png", bgI, shibaI, chainI)));
				}
			}
		}

	}

}
