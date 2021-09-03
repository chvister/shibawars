import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.Objects;

public class Main {

	public static final int WIDTH = 1240;
	public static final int HEIGHT = 1748;

	public static void main(String[] args) throws IOException {

		final String backgrounds = "image_bases/backgrounds";
		final String shibas = "image_bases/shibas";
		final String armors = "image_bases/armor";
		final String miscs = "image_bases/misc";

		final String output = "shibas";

		final int backgroundsLength = Objects.requireNonNull(new File(backgrounds).list()).length;
		final int shibasLength = Objects.requireNonNull(new File(shibas).list()).length;
		final int armorLength = Objects.requireNonNull(new File(armors).list()).length;
		final int miscLength = Objects.requireNonNull(new File(miscs).list()).length;

		for (int bgI = 0; bgI < backgroundsLength; ++bgI) {
			for (int shibaI = 0; shibaI < shibasLength; ++shibaI) {
				for (int armorI = 0; armorI < armorLength; ++armorI) {
					for (int miscI = 0; miscI < miscLength; ++miscI) {
						// load source images
						BufferedImage background = ImageIO.read(new File(backgrounds + "/" + bgI + ".png"));
						BufferedImage shiba = ImageIO.read(new File(shibas + "/" + shibaI + ".png"));
						BufferedImage armor = ImageIO.read(new File(armors + "/" + armorI + ".png"));
						BufferedImage misc = ImageIO.read(new File(miscs + "/" + miscI + ".png"));

						BufferedImage combined = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_ARGB);

						// paint both images, preserving the alpha channels
						Graphics g = combined.getGraphics();
						g.drawImage(background, 0, 0, null);
						g.drawImage(shiba, 0, 0, null);
						g.drawImage(armor, 0, 0, null);
						g.drawImage(misc, 0, 0, null);

						g.dispose();

						// Save as new image
						ImageIO.write(combined, "PNG", new File(output, String.format("%d%d%d%d.png", bgI, shibaI, armorI, miscI)));
					}
				}
			}
		}

	}

}
