/**
 * External Dependencies
 */
import React from 'react';
import { map, take } from 'lodash';

/**
 * Internal Dependencies
 */

class PostGallery extends React.Component {

	static propTypes = {
		post: React.PropTypes.object.isRequired
	}

	render() {
		const post = this.props.post;
		const numberOfImagesToDisplay = 4;
		const imagesToDisplay = take( post.content_images, numberOfImagesToDisplay );
		const listItems = map( imagesToDisplay, ( image, index ) => {
			return (
				<li key={ `post-${ post.ID }-image-${ index }` } className="reader-post-card__gallery-item">
					<img src={ image.src } />
				</li>
			);
		} );
		return (
			<ul className="reader-post-card__gallery">
				{ listItems }
			</ul>
		);
	}

}

export default PostGallery;
