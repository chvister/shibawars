import java.awt.image.BufferedImage
import java.io.File
import java.io.IOException
import java.util.*
import javax.imageio.ImageIO

object Main {
    const val WIDTH = 1240
    const val HEIGHT = 1748
    const val MAIN_PATH = "../../SHIBAWARS/IMAGE_BASES/"

    @JvmStatic
    fun main(args: Array<String>) {
//        processShiba("og-shiba", 105)
        processShiba("shiba-warlord", 106)
//        processShiba("shiba-warrior", 107)
    }

    @Throws(IOException::class)
    fun processShiba(shibaName: String, shibaId: Int) {
        val random = Random()
        val path = "$MAIN_PATH$shibaName/"

        val backgrounds = path + "background"
        val eyes = path + "eye"
        val heads = path + "head"
        val necklaces = path + "necklace"
        val miscs = path + "misc"
        val weapons = path + "weapon"
        val earrings = path + "earring"
        val output = "$MAIN_PATH../shibas"

        val bgLength = File(backgrounds).list()!!.size
        val eyeLength = File(eyes).list()!!.size
        val headLength = File(heads).list()!!.size
        val necklaceLength = File(necklaces).list()!!.size
        val miscLength = File(miscs).list()!!.size
        val wpLength = File(weapons).list()!!.size
        val earringLength = File(earrings).list()!!.size

        val shiba = ImageIO.read(File(path + "shiba/0.png"))
        val combinations = bgLength * (if (eyeLength > 0) eyeLength else 1) * (if (headLength > 0) headLength else 1) *
                (if (necklaceLength > 0) necklaceLength else 1) * (if (miscLength > 0) miscLength else 1) *
                (if (wpLength > 0) wpLength else 1) * (if (earringLength > 0) earringLength else 1)

        println("Gonna do $combinations combinations")

        var done = 0
        var alloc = 0.1f
        var next = combinations * alloc
        val started = System.currentTimeMillis()

        for (bgI in 0 until bgLength) {
            val isFolder = !File("$backgrounds/$bgI.png").exists()
            val folderLength = if (isFolder) File("$backgrounds/$bgI").list()!!.size else 0
            val randomBg = if (isFolder) random.nextInt(folderLength) else 0
            val background = if (isFolder) ImageIO.read(File("$backgrounds/$bgI/$randomBg.png")) else ImageIO.read(File("$backgrounds/$bgI.png"))
            var eyeI = 0
            while (eyeI < eyeLength || eyeI < 1) {
                val eye = if (eyeLength > 0) ImageIO.read(File("$eyes/$eyeI.png")) else null
                var headI = 0
                while (headI < headLength || headI < 1) {
                    val head = if (headLength > 0) ImageIO.read(File("$heads/$headI.png")) else null
                    var necklaceI = 0
                    while (necklaceI < necklaceLength || necklaceI < 1) {
                        val necklace = if (necklaceLength > 0) ImageIO.read(File("$necklaces/$necklaceI.png")) else null
                        var weaponI = 0
                        while (weaponI < wpLength || weaponI < 1) {
                            val weapon = if (wpLength > 0) ImageIO.read(File("$weapons/$weaponI.png")) else null
                            var earRingI = 0
                            while (earRingI < earringLength || earRingI < 1) {
                                val earring = if (earringLength > 0) ImageIO.read(File("$earrings/$earRingI.png")) else null
                                var miscI = 0
                                while (miscI < miscLength || miscI < 1) {
                                    val misc = if (miscLength > 0) ImageIO.read(File("$miscs/$miscI.png")) else null

                                    val combined = BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_ARGB)

                                    // paint both images, preserving the alpha channels
                                    val g = combined.graphics
                                    g.drawImage(background, 0, 0, null)
                                    g.drawImage(shiba, 0, 0, null)
                                    eye?.let { g.drawImage(it, 0, 0, null) }
                                    head?.let { g.drawImage(it, 0, 0, null) }
                                    misc?.let { g.drawImage(it, 0, 0, null) }
                                    necklace?.let { g.drawImage(it, 0, 0, null) }
                                    weapon?.let { g.drawImage(it, 0, 0, null) }
                                    earring?.let { g.drawImage(it, 0, 0, null) }
                                    g.dispose()

                                    val name = "$shibaId${bgI + randomBg}${if (eyeLength > 0) eyeI else ""}" +
                                            "${if (headLength > 0) headI else ""}${if (miscLength > 0) miscI else ""}" +
                                            "${if (necklaceLength > 0) necklaceI else ""}${if (wpLength > 0) weaponI else ""}" +
                                            "${if (earringLength > 0) earRingI else ""}.png"

                                    ImageIO.write(combined, "PNG", File(output, name))
                                    ++done
                                    if (done >= next) {
                                        println("${(alloc * 100).toInt()}% done")
                                        alloc += .1f
                                        next = combinations * alloc
                                    }
                                    ++miscI
                                }
                                ++earRingI
                            }
                            ++weaponI
                        }
                        ++necklaceI
                    }
                    ++headI
                }
                ++eyeI
            }
        }

        println("Finished in ${(System.currentTimeMillis() - started) / 1000}s")
    }


}