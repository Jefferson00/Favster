import styles from './styles.module.scss';
import RatingComponent, { RatingComponentProps } from 'react-rating';

interface RatingProps extends RatingComponentProps {
  value: number,
}

export function Rating({ value, ...rest }: RatingProps) {
  return (
    <div className={styles.ratingContainer}>
      <RatingComponent
        {...rest}
        emptySymbol={
          <img src="/star.svg" alt="favoritar" className="icon" />
        }
        fullSymbol={
          <img src="/star-selected.svg" alt="favoritar" className="icon" />
        }
        fractions={2}
        initialRating={value}
      />
    </div>
  )
}